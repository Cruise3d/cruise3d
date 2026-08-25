using cruise3d.Models.Entities;

namespace cruise3d.API.Repositories.Interfaces
{
    public interface INotificationTokenRepository
    {
        Task UpsertAsync(Guid userId, string token, string platform, string? userAgent);
        Task DeleteByTokenAsync(string token);
        Task<List<string>> GetByUserIdAsync(Guid userId);
        Task<List<string>> GetAllAdminTokensAsync();
        Task RemoveInvalidAsync(IEnumerable<string> tokens);
        Task<List<string>> GetStaleTokensAsync(DateTime olderThan);
        Task SetMutedAsync(string token, bool muted);
    }
}
