namespace cruise3d.API.Services.Interfaces;

public interface IEmailVerificationTokenService
{
    Task<(string RawToken, DateTime ExpiresAt, string VerificationLink)> IssueAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<bool> ConsumeAsync(string rawToken, CancellationToken cancellationToken = default);

    Task RevokeActiveAsync(Guid userId, CancellationToken cancellationToken = default);
}
