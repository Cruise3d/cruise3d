using System;
using System.Collections.Generic;

namespace cruise3d.Models.Entities
{
    public class Order
    {
        public Guid Id { get; set; }
        public Guid CustomerId { get; set; }
        public Guid AddressId { get; set; }
        public decimal Subtotal { get; set; }
        public decimal ShippingCharge { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "pending";
        public string PaymentStatus { get; set; } = "unpaid";
        public string? PaymentId { get; set; }
        public string? PaymentProvider { get; set; }
        public string? RazorpayOrderId { get; set; }
        public string? RazorpayPaymentId { get; set; }
        public DateTime PlacedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public User Customer { get; set; } = null!;
        public Address Address { get; set; } = null!;
        public ICollection<OrderItem> Items { get; set; } = [];
    }
}
