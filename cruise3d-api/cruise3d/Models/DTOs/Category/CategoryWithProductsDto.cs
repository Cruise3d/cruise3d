using cruise3d.API.Models.DTOs.Product;

namespace cruise3d.API.Models.DTOs.Category;

public class CategoryWithProductsDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? IconUrl { get; set; }
    public int SortOrder { get; set; }
    public List<ProductListItemDto> Products { get; set; } = new();
}