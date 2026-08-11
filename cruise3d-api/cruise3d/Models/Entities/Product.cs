using System;
using System.Collections.Generic;

namespace cruise3d.Models.Entities
{
    // Models/Entities/Product.cs
    public class Product
    {
        public Guid Id { get; set; }
        public Guid? CategoryId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Sku { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string? Material { get; set; }
        public double? WeightGrams { get; set; }
        public string? Dimensions { get; set; }
        public string? EstimatedDelivery { get; set; }
        public string ColorType { get; set; } = "fixed";   // "fixed" | "custom"
        public string? DefaultColorName { get; set; }
        public string? DefaultColorHex { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsBestseller { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public Category? Category { get; set; }
        public ICollection<ProductColor> Colors { get; set; } = new List<ProductColor>();
        public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
        public ICollection<ProductSpec> Specs { get; set; } = new List<ProductSpec>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }

}