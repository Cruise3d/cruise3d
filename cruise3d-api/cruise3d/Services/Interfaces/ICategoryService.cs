using cruise3d.Models.Entities;
using cruise3d.API.Models.DTOs.Category;

namespace cruise3d.API.Services.Interfaces;

public interface ICategoryService
{
    Task<IEnumerable<Category>> GetAllAsync();
    Task<IEnumerable<CategoryWithProductsDto>> GetAllWithProductsAsync();
    Task<Category> GetByIdAsync(Guid id);
    Task<Category> CreateAsync(string name, string slug, string? iconUrl);
    Task<Category> UpdateAsync(Guid id, string name, string slug, string? iconUrl);
    Task DeleteAsync(Guid id);
}
