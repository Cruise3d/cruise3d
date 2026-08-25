using FirebaseAdmin;
using cruise3d.API.Helpers;
using cruise3d.API.Models.DTOs.Common;
using cruise3d.API.Models.DTOs.Notification;
using cruise3d.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace cruise3d.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize(Roles = "admin")]
public class NotificationHealthController : ControllerBase
{
    private readonly INotificationService _notifications;
    private readonly IWebHostEnvironment _env;

    public NotificationHealthController(
        INotificationService notifications,
        IWebHostEnvironment env)
    {
        _notifications = notifications;
        _env = env;
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        var app = FirebaseApp.DefaultInstance;
        return Ok(new
        {
            firebaseInitialized = app != null,
            projectId = app?.Options.ProjectId,
            checkedAt = DateTime.UtcNow
        });
    }

    // Temporary development-only endpoint for browser FCM validation.
    // Keep disabled in production by returning 404 outside Development.
    [HttpPost("dev/test-admin-fcm")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public async Task<IActionResult> TestAdminFcm()
    {
        if (!_env.IsDevelopment())
        {
            return NotFound();
        }

        var userId = JwtHelper.GetUserId(User);
        var result = await _notifications.SendTestToUserAsync(
            userId,
            "FCM test",
            "This is a temporary development-only notification for the admin browser.",
            new
            {
                type = "dev_fcm_test",
                route = "/admin"
            });

        if (result.TargetCount == 0)
        {
            return NotFound(ApiResponse<object>.Fail("No admin FCM token is currently registered for this account."));
        }

        return Ok(ApiResponse<NotificationTestResultDto>.Ok(
            result,
            "Development FCM test sent."));
    }
}
