using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace cruise3d.API.Models.DTOs.Product;

public class ProductUpdateDto
{
    [MaxLength(255)]
    public string? Title { get; set; }

    public string? Description { get; set; }

    [MaxLength(100)]
    public string? Sku { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? Price { get; set; }

    [Range(0, int.MaxValue)]
    public int? Stock { get; set; }

    public Guid? CategoryId { get; set; }
    public string? Material { get; set; }
    public double? WeightGrams { get; set; }
    public string? Dimensions { get; set; }
    public string? EstimatedDelivery { get; set; }
    public string? ColorType { get; set; }
    public string? DefaultColorName { get; set; }
    public string? DefaultColorHex { get; set; }
    public List<ProductColorDto>? Colors { get; set; }
    public List<ProductImageInputDto>? Images { get; set; }
    public List<ProductSpecDto>? Specs { get; set; }
    public bool? IsFeatured { get; set; }
    public bool? IsBestseller { get; set; }
    public bool? IsActive { get; set; }
}
