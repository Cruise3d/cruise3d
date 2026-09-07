namespace cruise3d.API.Services.Interfaces;

public interface IPasswordResetTokenService
{
    Task<(string RawToken, DateTime ExpiresAt, string ResetLink)> IssueAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<Guid?> ValidateAndConsumeAsync(string rawToken, CancellationToken cancellationToken = default);

    Task RevokeActiveAsync(Guid userId, CancellationToken cancellationToken = default);
}
