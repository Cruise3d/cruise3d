using cruise3d.Models.Entities;

namespace cruise3d.API.Repositories.Interfaces
{
    public interface IPasswordResetTokenRepository
    {
        Task<PasswordResetToken?> GetByTokenHashAsync(string tokenHash);
        Task<List<PasswordResetToken>> GetActiveByUserIdAsync(Guid userId);
        Task<PasswordResetToken> CreateAsync(PasswordResetToken token);
        Task UpdateAsync(PasswordResetToken token);
        Task RevokeActiveByUserIdAsync(Guid userId, DateTime revokedAt);
        Task<Guid?> ValidateAndConsumeAsync(string tokenHash, DateTime consumedAt, CancellationToken cancellationToken = default);
    }
}
