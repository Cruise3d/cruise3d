using System;

namespace cruise3d.Models.Entities
{
    public class OrderItem
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }          // FK → orders.id
        public Guid ProductId { get; set; }        // FK → products.id
        public Guid? ProductColorId { get; set; }  // FK → product_colors.id (nullable)
        public string? ColorNameSnapshot { get; set; }
        public string? ColorHexSnapshot { get; set; }
        public int Quantity { get; set; }
        public decimal PriceAtPurchase { get; set; }

        public Order Order { get; set; } = null!;
        public Product Product { get; set; } = null!;
        public ProductColor? ProductColor { get; set; }
    }
}
