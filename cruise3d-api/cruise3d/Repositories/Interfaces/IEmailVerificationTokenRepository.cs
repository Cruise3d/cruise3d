using cruise3d.Models.Entities;

namespace cruise3d.API.Repositories.Interfaces
{
    public interface IEmailVerificationTokenRepository
    {
        Task<EmailVerificationToken?> GetByTokenHashAsync(string tokenHash);
        Task<List<EmailVerificationToken>> GetActiveByUserIdAsync(Guid userId);
        Task<EmailVerificationToken> CreateAsync(EmailVerificationToken token);
        Task UpdateAsync(EmailVerificationToken token);
        Task RevokeActiveByUserIdAsync(Guid userId, DateTime revokedAt);
        Task<Guid?> ValidateAndConsumeAsync(string tokenHash, DateTime consumedAt, CancellationToken cancellationToken = default);
    }
}
