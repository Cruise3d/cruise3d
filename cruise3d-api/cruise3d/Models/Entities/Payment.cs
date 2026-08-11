using System;

namespace cruise3d.Models.Entities
{
    // Payment record — created only after Razorpay signature verification succeeds.
    // Linked to a specific Order; the unique RazorpayOrderId constraint prevents
    // duplicate verifications from creating duplicate payments.
    public class Payment
    {
        public Guid Id { get; set; }
        // OrderId is nullable until payment is captured and an order is created
        public Guid? OrderId { get; set; }            // FK → orders.id
        public Guid UserId { get; set; }             // FK → users.id
        public string RazorpayOrderId { get; set; } = string.Empty;
        public string? RazorpayPaymentId { get; set; }
        // JSON snapshot of the cart at the time the payment intent was created.
        public string? CartSnapshot { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "INR";
        public string Provider { get; set; } = "razorpay";
        // Default status for newly-created payment intents should be "pending".
        // Keep class initializer in sync with DB default to avoid model diffs.
        public string Status { get; set; } = "pending";
        public DateTime CreatedAt { get; set; }

        public Order Order { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}
