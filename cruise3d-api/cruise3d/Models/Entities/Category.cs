using System;
using System.Collections.Generic;
namespace cruise3d.Models.Entities
{
    public class Category
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? IconUrl { get; set; }
        public int SortOrder { get; set; }

        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
