using cruise3d.Models.Entities;

namespace cruise3d.API.Repositories.Interfaces
{
    public interface IProductColorRepository
    {
        Task<IEnumerable<ProductColor>> GetByProductIdAsync(Guid productId);
        Task<ProductColor?> GetByIdAsync(Guid id);
        Task<ProductColor> CreateAsync(ProductColor color);
        Task UpdateAsync(ProductColor color);
        Task DeleteAsync(Guid id);
    }
}
