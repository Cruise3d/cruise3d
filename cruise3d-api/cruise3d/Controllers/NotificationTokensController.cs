using cruise3d.API.Helpers;
using cruise3d.API.Repositories.Interfaces;
using cruise3d.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace cruise3d.API.Controllers;

[ApiController]
[Route("api/notification-tokens")]
[Authorize] // any authenticated user (customer or admin) can register their own device
public class NotificationTokensController : ControllerBase
{
    private readonly INotificationTokenRepository _repo;
    private readonly INotificationService _notifications;

    public NotificationTokensController(
        INotificationTokenRepository repo,
        INotificationService notifications)
    {
        _repo = repo;
        _notifications = notifications;
    }

    public record RegisterNotificationTokenDto(string Token, string Platform = "web", string? UserAgent = null);
    public record MuteDto(bool Muted);

    [HttpPost]
    public async Task<IActionResult> Register([FromBody] RegisterNotificationTokenDto dto)
    {
        var userId = JwtHelper.GetUserId(User);
        var role   = JwtHelper.GetRole(User);

        await _repo.UpsertAsync(userId, dto.Token, dto.Platform, dto.UserAgent);

        // Admins auto-subscribe to the "admins" topic for broadcast notifications
        if (string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
        {
            await _notifications.SubscribeAdminAsync(dto.Token);
        }

        return Ok();
    }

    [HttpDelete("{token}")]
    [AllowAnonymous]
    public async Task<IActionResult> Unregister(string token)
    {
        await _notifications.UnsubscribeAdminAsync(token); // safe no-op for non-admins
        await _repo.DeleteByTokenAsync(token);
        return NoContent();
    }

    [HttpPatch("{token}/mute")]
    public async Task<IActionResult> Mute(string token, [FromBody] MuteDto dto)
    {
        await _repo.SetMutedAsync(token, dto.Muted);
        return NoContent();
    }
}
