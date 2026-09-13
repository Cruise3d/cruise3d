using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using cruise3d.API.Services.Interfaces;
using cruise3d.Models.Entities;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using cruise3d.Models.Settings;

namespace cruise3d.API.Services
{
    public class BrevoEmailService : IBrevoEmailService
    {
        private readonly HttpClient _httpClient;
        private readonly BrevoOptions _options;
        private readonly IHostEnvironment _environment;
        private readonly ILogger<BrevoEmailService> _logger;

        public BrevoEmailService(
            HttpClient httpClient,
            IOptions<BrevoOptions> options,
            IHostEnvironment environment,
            ILogger<BrevoEmailService> logger)
        {
            _httpClient = httpClient;
            _options = options.Value;
            _environment = environment;
            _logger = logger;
        }

        public async Task SendVerificationEmailAsync(
            string toEmail,
            string toName,
            string verificationLink,
            DateTime expiresAt,
            CancellationToken cancellationToken = default)
        {
            if (ShouldSkipInDevelopment("verification")) return;

            var subject = "Verify your Cruise3D email address";
            var htmlContent =
                $"<p>Hi {System.Net.WebUtility.HtmlEncode(toName)},</p>" +
                $"<p>Verify your Cruise3D email address by clicking <a href=\"{System.Net.WebUtility.HtmlEncode(verificationLink)}\">this link</a>.</p>" +
                $"<p>This link expires at {expiresAt:yyyy-MM-dd HH:mm} UTC.</p>";
            var textContent =
                $"Hi {toName},\n\n" +
                $"Verify your Cruise3D email address: {verificationLink}\n\n" +
                $"This link expires at {expiresAt:yyyy-MM-dd HH:mm} UTC.";

            await SendAsync(toEmail, toName, subject, htmlContent, textContent, cancellationToken);
        }

        public async Task SendPasswordResetEmailAsync(
            string toEmail,
            string toName,
            string resetLink,
            DateTime expiresAt,
            CancellationToken cancellationToken = default)
        {
            if (ShouldSkipInDevelopment("password reset")) return;

            var subject = "Reset your Cruise3D password";
            var htmlContent =
                $"<p>Hi {System.Net.WebUtility.HtmlEncode(toName)},</p>" +
                $"<p>We received a request to reset the password for your Cruise3D account.</p>" +
                $"<p><a href=\"{System.Net.WebUtility.HtmlEncode(resetLink)}\" style=\"display:inline-block;padding:10px 20px;background-color:#0284c7;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;\">Reset Password</a></p>" +
                $"<p>Or copy and paste this URL into your browser:</p>" +
                $"<p><a href=\"{System.Net.WebUtility.HtmlEncode(resetLink)}\">{System.Net.WebUtility.HtmlEncode(resetLink)}</a></p>" +
                $"<p>This password reset link will expire at {expiresAt:yyyy-MM-dd HH:mm} UTC.</p>" +
                $"<p>If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>";

            var textContent =
                $"Hi {toName},\n\n" +
                $"We received a request to reset the password for your Cruise3D account.\n\n" +
                $"Reset your password by opening this link: {resetLink}\n\n" +
                $"This password reset link will expire at {expiresAt:yyyy-MM-dd HH:mm} UTC.\n\n" +
                $"If you did not request a password reset, please ignore this email.";

            await SendAsync(toEmail, toName, subject, htmlContent, textContent, cancellationToken);
        }

        // ─── NEW: Admin order placed notification ─────────────────────────────
        public async Task SendAdminOrderPlacedEmailAsync(
            Order order,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(_options.AdminNotificationEmail))
            {
                _logger.LogWarning(
                    "Brevo:AdminNotificationEmail is not configured; skipping admin order email.");
                return;
            }

            if (ShouldSkipInDevelopment("admin order")) return;

            var shortId = order.Id.ToString()[..8].ToUpperInvariant();
            var subject = $"🛒 New Order #{shortId} — ₹{order.TotalAmount:N2}";
            var htmlContent = BuildAdminOrderHtml(order);
            var textContent = BuildAdminOrderText(order);

            // Support comma-separated admin recipients.
            var recipients = _options.AdminNotificationEmail
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

            foreach (var recipient in recipients)
            {
                await SendAsync(
                    toEmail: recipient,
                    toName: "Cruise3D Admin",
                    subject: subject,
                    htmlContent: htmlContent,
                    textContent: textContent,
                    cancellationToken: cancellationToken);
            }
        }

        // ─── Shared send helper (deduplicates Brevo POST) ─────────────────────
        private async Task SendAsync(
            string toEmail,
            string toName,
            string subject,
            string htmlContent,
            string textContent,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(_options.ApiKey))
                throw new InvalidOperationException("Brevo API key is not configured.");

            if (string.IsNullOrWhiteSpace(_options.SenderEmail))
                throw new InvalidOperationException("Brevo sender email is not configured.");

            using var request = new HttpRequestMessage(HttpMethod.Post, "smtp/email")
            {
                Content = JsonContent.Create(new
                {
                    sender = new
                    {
                        email = _options.SenderEmail,
                        name = _options.SenderName
                    },
                    to = new[]
                    {
                        new { email = toEmail, name = toName }
                    },
                    subject,
                    htmlContent,
                    textContent
                }, options: new JsonSerializerOptions(JsonSerializerDefaults.Web))
            };

            request.Headers.TryAddWithoutValidation("api-key", _options.ApiKey);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            using var response = await _httpClient.SendAsync(request, cancellationToken);
            if (response.IsSuccessStatusCode)
                return;

            _logger.LogError(
                "Brevo email ({Subject}) failed with status {StatusCode}.",
                subject, (int)response.StatusCode);

            throw new InvalidOperationException("Brevo email request failed.");
        }

        // ─── Development skip guard ───────────────────────────────────────────
        private bool ShouldSkipInDevelopment(string emailKind)
        {
            if (_environment.IsDevelopment() && !_options.EnabledInDevelopment)
            {
                _logger.LogInformation(
                    "Skipping Brevo {Kind} email in Development because Brevo:EnabledInDevelopment is false.",
                    emailKind);
                return true;
            }
            return false;
        }

        // ─── Admin order HTML template ────────────────────────────────────────
        private static string BuildAdminOrderHtml(Order order)
        {
            string H(string? s) => System.Net.WebUtility.HtmlEncode(s ?? string.Empty);

            var sb = new StringBuilder();
            var customerEmail = order.Customer?.Email ?? "(unknown)";
            var customerName  = order.Customer?.Name
                                ?? order.Address?.FullName
                                ?? "(unknown)";
            var placedAtLocal = order.PlacedAt.ToLocalTime().ToString("dd MMM yyyy, hh:mm tt");
            var shortId       = order.Id.ToString()[..8].ToUpperInvariant();

            sb.Append($@"
<!DOCTYPE html>
<html>
<head>
  <meta charset=""utf-8"" />
  <style>
    body {{ font-family: Arial, Helvetica, sans-serif; background:#f4f3f0; margin:0; padding:24px; color:#1a1a1a; }}
    .card {{ max-width:640px; margin:0 auto; background:#fff; border:1px solid #e5e5e5; border-radius:12px; overflow:hidden; }}
    .header {{ background:#1a1a1a; color:#fff; padding:20px 24px; }}
    .header h1 {{ margin:0; font-size:18px; }}
    .section {{ padding:20px 24px; border-bottom:1px solid #f0f0f0; }}
    .section:last-child {{ border-bottom:none; }}
    .label {{ font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:#737373; margin-bottom:6px; }}
    .value {{ font-size:14px; }}
    table {{ width:100%; border-collapse:collapse; margin-top:8px; }}
    th, td {{ text-align:left; font-size:13px; padding:8px 6px; border-bottom:1px solid #f0f0f0; }}
    th {{ color:#737373; text-transform:uppercase; font-size:11px; letter-spacing:0.08em; }}
    .totals tr:last-child td {{ font-weight:bold; border-top:2px solid #1a1a1a; border-bottom:none; }}
    .pill {{ display:inline-block; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:600; }}
    .pill-paid {{ background:#dcfce7; color:#166534; }}
    .pill-pending {{ background:#fef3c7; color:#92400e; }}
    .pill-unpaid {{ background:#fee2e2; color:#991b1b; }}
  </style>
</head>
<body>
  <div class=""card"">
    <div class=""header"">
      <h1>New Order Received</h1>
      <p style=""margin:6px 0 0; font-size:13px; opacity:0.8;"">Order #{shortId} &middot; {H(placedAtLocal)}</p>
    </div>

    <div class=""section"">
      <div class=""label"">Payment</div>
      <span class=""pill pill-{H(order.PaymentStatus.ToLowerInvariant())}"">{H(order.PaymentStatus.ToUpperInvariant())}</span>
      <span class=""pill"" style=""background:#e5e7eb;color:#374151;margin-left:6px;"">{H(order.Status.ToUpperInvariant())}</span>
    </div>

    <div class=""section"">
      <div class=""label"">Customer</div>
      <div class=""value"">{H(customerName)}<br/>{H(customerEmail)}</div>
    </div>

    <div class=""section"">
      <div class=""label"">Shipping Address</div>
      <div class=""value"">
        {H(order.Address?.FullName)}<br/>
        {H(order.Address?.AddressLine)}<br/>
        {H(order.Address?.City)}, {H(order.Address?.State)} — {H(order.Address?.Pincode)}<br/>
        📞 {H(order.ShippingPhone)}
      </div>
    </div>

    <div class=""section"">
      <div class=""label"">Items</div>
      <table>
        <thead>
          <tr>
            <th>Product</th><th>Color</th>
            <th style=""text-align:right;"">Qty</th>
            <th style=""text-align:right;"">Price</th>
            <th style=""text-align:right;"">Total</th>
          </tr>
        </thead>
        <tbody>");

            foreach (var item in order.Items)
            {
                var title = H(item.Product?.Title ?? "(deleted product)");
                var color = H(item.ColorNameSnapshot ?? "—");
                var lineTotal = item.PriceAtPurchase * item.Quantity;

                sb.Append($@"
          <tr>
            <td>{title}</td>
            <td>{color}</td>
            <td style=""text-align:right;"">{item.Quantity}</td>
            <td style=""text-align:right;"">₹{item.PriceAtPurchase:N2}</td>
            <td style=""text-align:right;"">₹{lineTotal:N2}</td>
          </tr>");
            }

            sb.Append($@"
        </tbody>
      </table>
    </div>

    <div class=""section"">
      <table class=""totals"">
        <tr><td>Subtotal</td><td style=""text-align:right;"">₹{order.Subtotal:N2}</td></tr>
        <tr><td>Shipping</td><td style=""text-align:right;"">₹{order.ShippingCharge:N2}</td></tr>
        <tr><td>Total</td><td style=""text-align:right;"">₹{order.TotalAmount:N2}</td></tr>
      </table>
    </div>

    <div class=""section"" style=""background:#fafafa; font-size:12px; color:#737373;"">
      Payment provider: <strong>{H(order.PaymentProvider ?? "cod")}</strong>
      {(string.IsNullOrEmpty(order.PaymentId) ? "" : $" &middot; Payment ID: <code>{H(order.PaymentId)}</code>")}
    </div>
  </div>
</body>
</html>");

            return sb.ToString();
        }

        // ─── Admin order plain-text fallback ──────────────────────────────────
        private static string BuildAdminOrderText(Order order)
        {
            var sb = new StringBuilder();
            var customerEmail = order.Customer?.Email ?? "(unknown)";
            var customerName  = order.Customer?.Name
                                ?? order.Address?.FullName
                                ?? "(unknown)";
            var shortId = order.Id.ToString()[..8].ToUpperInvariant();

            sb.AppendLine($"New Order #{shortId}");
            sb.AppendLine($"Placed: {order.PlacedAt:yyyy-MM-dd HH:mm} UTC");
            sb.AppendLine($"Payment: {order.PaymentStatus} ({order.PaymentProvider ?? "cod"})");
            sb.AppendLine($"Status: {order.Status}");
            sb.AppendLine();
            sb.AppendLine($"Customer: {customerName} <{customerEmail}>");
            sb.AppendLine($"Phone: {order.ShippingPhone}");
            sb.AppendLine();
            sb.AppendLine("Shipping Address:");
            sb.AppendLine($"  {order.Address?.FullName}");
            sb.AppendLine($"  {order.Address?.AddressLine}");
            sb.AppendLine($"  {order.Address?.City}, {order.Address?.State} - {order.Address?.Pincode}");
            sb.AppendLine();
            sb.AppendLine("Items:");

            foreach (var item in order.Items)
            {
                var lineTotal = item.PriceAtPurchase * item.Quantity;
                sb.AppendLine(
                    $"  - {item.Product?.Title ?? "(deleted)"} " +
                    $"[{item.ColorNameSnapshot ?? "—"}] " +
                    $"x{item.Quantity} @ ₹{item.PriceAtPurchase:N2} = ₹{lineTotal:N2}");
            }

            sb.AppendLine();
            sb.AppendLine($"Subtotal: ₹{order.Subtotal:N2}");
            sb.AppendLine($"Shipping: ₹{order.ShippingCharge:N2}");
            sb.AppendLine($"Total:    ₹{order.TotalAmount:N2}");

            return sb.ToString();
        }
    }
}