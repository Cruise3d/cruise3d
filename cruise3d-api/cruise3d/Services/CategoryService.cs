using cruise3d.Models.Entities;
using cruise3d.API.Repositories.Interfaces;
using cruise3d.API.Services.Interfaces;

namespace cruise3d.API.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categories;

    public CategoryService(ICategoryRepository categories)
    {
        _categories = categories;
    }

    public async Task<IEnumerable<Category>> GetAllAsync()
        => await _categories.GetAllAsync();

    public async Task<Category> GetByIdAsync(Guid id)
        => await _categories.GetByIdAsync(id)
            ?? throw new Exception("Category not found.");

    public async Task<Category> CreateAsync(string name, string slug, string? iconUrl)
    {
        var category = new Category
        {
            Id      = Guid.NewGuid(),
            Name    = name,
            Slug    = slug.ToLower().Trim(),
            IconUrl = iconUrl
        };
        return await _categories.CreateAsync(category);
    }

    public async Task<Category> UpdateAsync(Guid id, string name,
        string slug, string? iconUrl)
    {
        var category = await _categories.GetByIdAsync(id)
            ?? throw new Exception("Category not found.");

        category.Name    = name;
        category.Slug    = slug.ToLower().Trim();
        category.IconUrl = iconUrl;

        await _categories.UpdateAsync(category);
        return category;
    }

    public async Task DeleteAsync(Guid id)
    {
        var category = await _categories.GetByIdAsync(id)
            ?? throw new Exception("Category not found.");

        await _categories.DeleteAsync(id);
    }
}
