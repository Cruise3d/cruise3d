using System;
using System.Collections.Generic;

namespace cruise3d.API.Models.DTOs.Product;

public class ProductResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Sku { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string? Material { get; set; }
    public double? WeightGrams { get; set; }
    public string? Dimensions { get; set; }
    public string? EstimatedDelivery { get; set; }
    public string ColorType { get; set; } = string.Empty;
    public string? DefaultColorName { get; set; }
    public string? DefaultColorHex { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsBestseller { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

    // Category info
    public Guid? CategoryId { get; set; }
    public string? CategoryName { get; set; }

    // Related data
    public List<ProductColorResponseDto> Colors { get; set; } = new List<ProductColorResponseDto>();
    public List<ProductImageResponseDto> Images { get; set; } = new List<ProductImageResponseDto>();
    public List<ProductSpecResponseDto> Specs { get; set; } = new List<ProductSpecResponseDto>();

    // Calculated fields
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
}

public class ProductColorResponseDto
{
    public Guid Id { get; set; }
    public string ColorName { get; set; } = string.Empty;
    public string ColorHex { get; set; } = string.Empty;
    public int? StockOverride { get; set; }
    public int SortOrder { get; set; }
}

public class ProductImageResponseDto
{
    public Guid Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
    public Guid? ProductColorId { get; set; }
}

public class ProductSpecResponseDto
{
    public Guid Id { get; set; }
    public string SpecKey { get; set; } = string.Empty;
    public string SpecValue { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}
