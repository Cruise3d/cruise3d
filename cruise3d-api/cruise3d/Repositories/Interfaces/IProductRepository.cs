using cruise3d.Models.Entities;

namespace cruise3d.API.Repositories.Interfaces
{
    public interface IProductRepository
    {
        Task<(IEnumerable<Product> Items, int Total)> GetCustomerProductsAsync(
            Guid? categoryId, string? search, decimal? minPrice, decimal? maxPrice,
            string? sortBy, int page, int pageSize);
        Task<(IEnumerable<Product> Items, int Total)> GetAdminProductsAsync(
            Guid? categoryId, string? search, decimal? minPrice, decimal? maxPrice,
            string? sortBy, int page, int pageSize);
        Task<Product?> GetByIdAsync(Guid id);
        Task<Product?> GetCustomerByIdWithDetailsAsync(Guid id);
        Task<Product?> GetAdminByIdWithDetailsAsync(Guid id);
        Task<IEnumerable<Product>> GetFeaturedAsync();
        Task<IEnumerable<Product>> GetBestsellersAsync();
        Task<IEnumerable<Product>> GetByCategoryIdAsync(Guid categoryId);
        Task<Product> CreateAsync(Product product);
        Task UpdateAsync(Product product);
        Task DeleteAsync(Guid id);
        Task<bool> SkuExistsAsync(string sku, Guid? excludeId = null);
    }
}
