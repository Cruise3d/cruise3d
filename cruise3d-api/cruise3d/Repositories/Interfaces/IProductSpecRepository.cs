using cruise3d.Models.Entities;

namespace cruise3d.API.Repositories.Interfaces
{
    public interface IProductSpecRepository
    {
        Task<IEnumerable<ProductSpec>> GetByProductIdAsync(Guid productId);
        Task<ProductSpec?> GetByIdAsync(Guid id);
        Task<ProductSpec> CreateAsync(ProductSpec spec);
        Task UpdateAsync(ProductSpec spec);
        Task DeleteAsync(Guid id);
        Task DeleteByProductIdAsync(Guid productId);
    }
}
