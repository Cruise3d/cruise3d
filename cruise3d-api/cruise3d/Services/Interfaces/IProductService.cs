using cruise3d.API.Models.DTOs.Product;

namespace cruise3d.API.Services.Interfaces;

public interface IProductService
{
    // Customer facing
    Task<(IEnumerable<ProductListItemDto> Items, int Total)> GetAllAsync(
        Guid? categoryId,
        string? search,
        decimal? minPrice,
        decimal? maxPrice,
        string? sortBy,
        int page,
        int pageSize);

    Task<ProductResponseDto> GetByIdAsync(Guid id);
    Task<IEnumerable<ProductListItemDto>> GetFeaturedAsync();
    Task<IEnumerable<ProductListItemDto>> GetBestsellersAsync();

    // Admin facing
    Task<ProductResponseDto> CreateAsync(ProductCreateDto dto);
    Task<ProductResponseDto> UpdateAsync(Guid id, ProductUpdateDto dto);
    Task DeleteAsync(Guid id);
    Task<bool> SkuExistsAsync(string sku, Guid? excludeId = null);
}
