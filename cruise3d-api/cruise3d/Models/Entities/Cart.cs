using System;

namespace cruise3d.Models.Entities
{
    public class Cart
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }           // FK → users.id
        public Guid ProductId { get; set; }        // FK → products.id
        public Guid? ProductColorId { get; set; }  // FK → product_colors.id (nullable)
        public int Quantity { get; set; } = 1;
        public DateTime AddedAt { get; set; }

        public User User { get; set; } = null!;
        public Product Product { get; set; } = null!;
        public ProductColor? ProductColor { get; set; }
    }
}
