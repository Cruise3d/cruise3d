using System;

namespace cruise3d.API.Models.DTOs.Product;

public class ProductListItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public bool IsInStock => Stock > 0;
    public string? CategoryName { get; set; }
    public string ColorType { get; set; } = string.Empty;

    // Primary image only
    public string? PrimaryImageUrl { get; set; }

    // Rating summary
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
}
