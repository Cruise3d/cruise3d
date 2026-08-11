using System;

namespace cruise3d.Models.Entities
{
    public class Review
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }        // FK → products.id
        public Guid CustomerId { get; set; }       // FK → users.id
        public Guid OrderId { get; set; }          // FK → orders.id
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }

        public Product Product { get; set; } = null!;
        public User Customer { get; set; } = null!;
        public Order Order { get; set; } = null!;
    }
}
