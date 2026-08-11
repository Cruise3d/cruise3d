using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace cruise3d.API.Models.DTOs.Product;

public class ProductCreateDto
{
    [Required(ErrorMessage = "Title is required")]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required(ErrorMessage = "SKU is required")]
    [MaxLength(100)]
    public string Sku { get; set; } = string.Empty;

    [Required]
    [Range(0, double.MaxValue, ErrorMessage = "Price must be positive")]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Stock must be positive")]
    public int Stock { get; set; }

    public Guid? CategoryId { get; set; }

    public string? Material { get; set; }
    public double? WeightGrams { get; set; }
    public string? Dimensions { get; set; }
    public string? EstimatedDelivery { get; set; }

    [Required]
    public string ColorType { get; set; } = "fixed";  // "fixed" or "custom"

    // Used when ColorType = "fixed"
    public string? DefaultColorName { get; set; }
    public string? DefaultColorHex { get; set; }

    // Used when ColorType = "custom"
    public List<ProductColorDto> Colors { get; set; } = new List<ProductColorDto>();

    // Product gallery images stored in Cloudinary
    public List<ProductImageInputDto> Images { get; set; } = new List<ProductImageInputDto>();

    // Used when ColorType = "custom"  
    public List<ProductSpecDto> Specs { get; set; } = new List<ProductSpecDto>();

    public bool IsFeatured { get; set; } = false;
    public bool IsBestseller { get; set; } = false;
}

public class ProductColorDto
{
    [Required]
    [MaxLength(50)]
    public string ColorName { get; set; } = string.Empty;

    [Required]
    [MaxLength(7)]
    public string ColorHex { get; set; } = string.Empty;

    public int? StockOverride { get; set; }
    public int SortOrder { get; set; } = 0;
}

public class ProductSpecDto
{
    [Required]
    [MaxLength(100)]
    public string SpecKey { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string SpecValue { get; set; } = string.Empty;

    public int SortOrder { get; set; } = 0;
}

public class ProductImageInputDto
{
    [Required]
    [MaxLength(2048)]
    public string Url { get; set; } = string.Empty;

    public bool IsPrimary { get; set; } = false;
    public int SortOrder { get; set; } = 0;
    public Guid? ProductColorId { get; set; }
}
