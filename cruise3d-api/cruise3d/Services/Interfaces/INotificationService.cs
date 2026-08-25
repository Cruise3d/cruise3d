using cruise3d.Models.Entities;
using cruise3d.API.Models.DTOs.Notification;

namespace cruise3d.API.Services.Interfaces;

public interface INotificationService
{
    Task SendToUserAsync(Guid userId, string title, string body, object? data = null);
    Task SendToAdminsAsync(string title, string body, object? data = null);
    Task SendNewOrderAsync(Order order);
    Task<NotificationTestResultDto> SendTestToUserAsync(Guid userId, string title, string body, object? data = null);

    // Topic helpers used by NotificationTokensController
    Task SubscribeAdminAsync(string token);
    Task UnsubscribeAdminAsync(string token);
}
