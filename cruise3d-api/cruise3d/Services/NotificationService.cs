using System.Text.Json;
using cruise3d.Models.Entities;
using cruise3d.API.Repositories.Interfaces;
using cruise3d.API.Models.DTOs.Notification;
using cruise3d.API.Services.Interfaces;
using FirebaseAdmin.Messaging;
using Microsoft.Extensions.Logging;

namespace cruise3d.API.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationTokenRepository _tokens;
    private readonly IConfiguration _config;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        INotificationTokenRepository tokens,
        IConfiguration config,
        ILogger<NotificationService> logger)
    {
        _tokens = tokens;
        _config = config;
        _logger = logger;
    }

    // FCM "data" payload only accepts string values — serialize then coerce.
    private static Dictionary<string, string> ToStringMap(object? data)
    {
        if (data == null) return new Dictionary<string, string>();
        var json = JsonSerializer.Serialize(data);
        var map = JsonSerializer.Deserialize<Dictionary<string, string>>(json)
                  ?? new Dictionary<string, string>();
        return map;
    }

    private static bool IsInvalidTokenError(FirebaseAdmin.ErrorCode? code)
    {
        // FirebaseAdmin.ErrorCode is the broad enum that FirebaseMessagingException
        // exposes; compare by name against MessagingErrorCode to keep us in sync
        // with the messaging-specific names without a fragile cast.
        if (code is null) return false;
        var name = code.ToString();
        return name == MessagingErrorCode.Unregistered.ToString()
            || name == MessagingErrorCode.SenderIdMismatch.ToString()
            || name == MessagingErrorCode.InvalidArgument.ToString();
    }

    private static NotificationTestResultDto BuildResult(
        IReadOnlyList<string> tokens,
        BatchResponse? response,
        string? errorMessage = null)
    {
        if (tokens.Count == 0)
        {
            return new NotificationTestResultDto(
                TargetCount: 0,
                SuccessCount: 0,
                FailureCount: 0,
                Responses: Array.Empty<NotificationTargetResultDto>(),
                ErrorMessage: errorMessage);
        }

        if (response == null)
        {
            return new NotificationTestResultDto(
                TargetCount: tokens.Count,
                SuccessCount: 0,
                FailureCount: tokens.Count,
                Responses: tokens.Select((token, index) => new NotificationTargetResultDto(
                        Index: index,
                        TokenSuffix: token.Length >= 4 ? token[^4..] : token,
                        Success: false,
                        ErrorCode: "SendFailed",
                        ErrorMessage: errorMessage))
                    .ToList(),
                ErrorMessage: errorMessage);
        }

        var responses = new List<NotificationTargetResultDto>(response.Responses.Count);
        for (var i = 0; i < response.Responses.Count; i++)
        {
            var sendResponse = response.Responses[i];
            var token = tokens[i];
            var code = sendResponse.Exception is FirebaseMessagingException fmex
                ? fmex.ErrorCode.ToString()
                : sendResponse.Exception?.GetType().Name;

            responses.Add(new NotificationTargetResultDto(
                Index: i,
                TokenSuffix: token.Length >= 4 ? token[^4..] : token,
                Success: sendResponse.IsSuccess,
                ErrorCode: code,
                ErrorMessage: sendResponse.Exception?.Message));
        }

        return new NotificationTestResultDto(
            TargetCount: tokens.Count,
            SuccessCount: response.SuccessCount,
            FailureCount: response.FailureCount,
            Responses: responses);
    }

    private async Task<BatchResponse?> SendMulticastAsync(
        IReadOnlyList<string> tokens,
        string title,
        string body,
        IReadOnlyDictionary<string, string> data)
    {
        if (tokens.Count == 0) return null;

        var msg = new MulticastMessage
        {
            Tokens = tokens.ToList(),
            Notification = new Notification { Title = title, Body = body },
            Data = data as Dictionary<string, string> ?? new Dictionary<string, string>(data),
            Webpush = new WebpushConfig
            {
                FcmOptions = new WebpushFcmOptions { Link = GetWebPushLink() },
                Headers = new Dictionary<string, string>
                {
                    ["Urgency"] = "high",
                    ["TTL"] = "60"
                }
            }
            };

        try
        {
            var resp = await FirebaseMessaging.DefaultInstance
                .SendEachForMulticastAsync(msg);

            _logger.LogInformation(
                "FCM multicast: success={Ok} fail={Fail}",
                resp.SuccessCount, resp.FailureCount);

            var bad = new List<string>();
            for (var i = 0; i < resp.Responses.Count; i++)
            {
                var r = resp.Responses[i];
                if (r.Exception is FirebaseMessagingException fmex
                    && IsInvalidTokenError(fmex.ErrorCode))
                {
                    bad.Add(tokens[i]);
                }
                else if (r.Exception != null)
                {
                    _logger.LogWarning(
                        "FCM send error for token[..{Last4}]: {Code} {Msg}",
                        tokens[i].Length >= 4 ? tokens[i][^4..] : tokens[i],
                        r.Exception.GetType().Name,
                        r.Exception.Message);
                }
            }

            if (bad.Count > 0)
            {
                await _tokens.RemoveInvalidAsync(bad);
                _logger.LogInformation(
                    "Removed {Count} invalid FCM tokens", bad.Count);
            }

            return resp;
        }
        catch (Exception ex)
        {
            // Never let push failures surface — log and continue
            _logger.LogError(ex, "FCM multicast send failed");
            return null;
        }
    }

    private string GetWebPushLink()
    {
        var configuredLink = _config["Notification:WebPushLink"]
            ?? _config["Notifications:WebPushLink"]
            ?? _config["App:PublicUrl"]
            ?? _config["Frontend:BaseUrl"];

        if (Uri.TryCreate(configuredLink, UriKind.Absolute, out var uri)
            && uri.Scheme.Equals(Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase))
        {
            return configuredLink!;
        }

        // FCM webpush links must be absolute HTTPS URLs. Use a safe default so
        // local/dev environments do not fail message construction.
        return "https://localhost";
    }

    public async Task SendToUserAsync(
        Guid userId, string title, string body, object? data = null)
    {
        var tokens = await _tokens.GetByUserIdAsync(userId);
        await SendMulticastAsync(tokens, title, body, ToStringMap(data));
    }

    public async Task SendToAdminsAsync(
        string title, string body, object? data = null)
    {
        var tokens = await _tokens.GetAllAdminTokensAsync();
        await SendMulticastAsync(tokens, title, body, ToStringMap(data));
    }

    public async Task<NotificationTestResultDto> SendTestToUserAsync(
        Guid userId, string title, string body, object? data = null)
    {
        var tokens = await _tokens.GetByUserIdAsync(userId);
        var response = await SendMulticastAsync(tokens, title, body, ToStringMap(data));
        return BuildResult(tokens, response);
    }

    public async Task SendNewOrderAsync(Order order)
    {
        await SendToAdminsAsync(
            "New order placed",
            $"Order #{order.Id.ToString()[..8]} placed — ₹{order.TotalAmount:N2} ({order.PaymentStatus})",
            new Dictionary<string, string>
            {
                ["orderId"] = order.Id.ToString(),
                ["customerId"] = order.CustomerId.ToString(),
                ["totalAmount"] = order.TotalAmount.ToString("F2"),
                ["paymentStatus"] = order.PaymentStatus,
                ["status"] = order.Status,
                ["type"] = "new_order"
            });
    }

    /// <summary>
    /// Subscribe the token to the "admins" topic so future broadcasts can
    /// target the topic instead of looking up admin tokens each time.
    /// Called from the controller after UpsertAsync.
    /// </summary>
    public async Task SubscribeAdminAsync(string token)
    {
        try
        {
            await FirebaseMessaging.DefaultInstance
                .SubscribeToTopicAsync(new[] { token }, "admins");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "FCM topic subscribe failed");
        }
    }

    public async Task UnsubscribeAdminAsync(string token)
    {
        try
        {
            await FirebaseMessaging.DefaultInstance
                .UnsubscribeFromTopicAsync(new[] { token }, "admins");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "FCM topic unsubscribe failed");
        }
    }
}
