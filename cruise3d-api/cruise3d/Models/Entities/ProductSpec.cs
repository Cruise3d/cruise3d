using System;

namespace cruise3d.Models.Entities
{
    public class ProductSpec
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }        // FK → products.id
        public string SpecKey { get; set; } = string.Empty;
        public string SpecValue { get; set; } = string.Empty;
        public int SortOrder { get; set; }

        public Product Product { get; set; } = null!;
    }
}
