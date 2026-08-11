using System;

namespace cruise3d.Models.Entities
{
    public class ProductImage
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }        // FK → products.id
        public Guid? ProductColorId { get; set; }  // FK → product_colors.id (nullable)
        public string Url { get; set; } = string.Empty;
        public bool IsPrimary { get; set; }
        public int SortOrder { get; set; }

        public Product Product { get; set; } = null!;
        public ProductColor? ProductColor { get; set; }
    }
}
