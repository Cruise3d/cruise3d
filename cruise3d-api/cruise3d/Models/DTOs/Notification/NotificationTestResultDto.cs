namespace cruise3d.API.Models.DTOs.Notification;

public sealed record NotificationTargetResultDto(
    int Index,
    string TokenSuffix,
    bool Success,
    string? ErrorCode,
    string? ErrorMessage);

public sealed record NotificationTestResultDto(
    int TargetCount,
    int SuccessCount,
    int FailureCount,
    IReadOnlyList<NotificationTargetResultDto> Responses,
    string? ErrorMessage = null);
