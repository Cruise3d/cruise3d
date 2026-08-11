using System;
using System.Collections.Generic;

namespace cruise3d.Models.Entities
{
    public class ProductColor
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }        // FK → products.id
        public string ColorName { get; set; } = string.Empty;
        public string ColorHex { get; set; } = string.Empty;
        public int? StockOverride { get; set; }
        public int SortOrder { get; set; }

        public Product Product { get; set; } = null!;
        public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    }
}
