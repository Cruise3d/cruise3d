using cruise3d.Models.Entities;

namespace cruise3d.API.Repositories.Interfaces
{
    public interface ICartRepository
    {
        Task<IEnumerable<Cart>> GetByUserIdAsync(Guid userId);
        Task<Cart?> GetByIdAsync(Guid id);
        Task<Cart?> GetByUserAndProductAsync(Guid userId, Guid productId, Guid? productColorId);
        Task<Cart> CreateAsync(Cart cart);
        Task UpdateAsync(Cart cart);
        Task DeleteAsync(Guid id);
        Task DeleteByUserIdAsync(Guid userId);
    }
}
