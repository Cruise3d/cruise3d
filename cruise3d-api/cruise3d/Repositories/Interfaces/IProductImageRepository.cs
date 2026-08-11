using cruise3d.Models.Entities;

namespace cruise3d.API.Repositories.Interfaces
{
    public interface IProductImageRepository
    {
        Task<IEnumerable<ProductImage>> GetByProductIdAsync(Guid productId);
        Task<IEnumerable<ProductImage>> GetByProductColorIdAsync(Guid productColorId);
        Task<ProductImage?> GetByIdAsync(Guid id);
        Task<ProductImage> CreateAsync(ProductImage image);
        Task UpdateAsync(ProductImage image);
        Task DeleteAsync(Guid id);
        Task DeleteByProductIdAsync(Guid productId);
    }
}
