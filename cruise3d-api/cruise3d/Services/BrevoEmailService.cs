using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using cruise3d.API.Services.Interfaces;
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
            if (_environment.IsDevelopment() && !_options.EnabledInDevelopment)
            {
                _logger.LogInformation(
                    "Skipping Brevo verification email in Development because Brevo:EnabledInDevelopment is false.");
                return;
            }

            if (string.IsNullOrWhiteSpace(_options.ApiKey))
                throw new InvalidOperationException("Brevo API key is not configured.");

            if (string.IsNullOrWhiteSpace(_options.SenderEmail))
                throw new InvalidOperationException("Brevo sender email is not configured.");

            var subject = "Verify your Cruise3D email address";
            var htmlContent =
                $"<p>Hi {System.Net.WebUtility.HtmlEncode(toName)},</p>" +
                $"<p>Verify your Cruise3D email address by clicking <a href=\"{System.Net.WebUtility.HtmlEncode(verificationLink)}\">this link</a>.</p>" +
                $"<p>This link expires at {expiresAt:yyyy-MM-dd HH:mm} UTC.</p>";
            var textContent =
                $"Hi {toName},\n\n" +
                $"Verify your Cruise3D email address: {verificationLink}\n\n" +
                $"This link expires at {expiresAt:yyyy-MM-dd HH:mm} UTC.";

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
                "Brevo verification email failed with status {StatusCode}.",
                (int)response.StatusCode);

            throw new InvalidOperationException("Brevo verification email request failed.");
        }

        public async Task SendPasswordResetEmailAsync(
            string toEmail,
            string toName,
            string resetLink,
            DateTime expiresAt,
            CancellationToken cancellationToken = default)
        {
            if (_environment.IsDevelopment() && !_options.EnabledInDevelopment)
            {
                _logger.LogInformation(
                    "Skipping Brevo password reset email in Development because Brevo:EnabledInDevelopment is false.");
                return;
            }

            if (string.IsNullOrWhiteSpace(_options.ApiKey))
                throw new InvalidOperationException("Brevo API key is not configured.");

            if (string.IsNullOrWhiteSpace(_options.SenderEmail))
                throw new InvalidOperationException("Brevo sender email is not configured.");

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
                "Brevo password reset email failed with status {StatusCode}.",
                (int)response.StatusCode);

            throw new InvalidOperationException("Brevo password reset email request failed.");
        }
    }
}

