using System.ComponentModel.DataAnnotations;

namespace cruise3d.API.Models.DTOs.Payment;

// POST /api/payments/verify request
// Frontend sends these three values returned by Razorpay Checkout,
// along with the address to ship to.
public class VerifyPaymentRequestDto
{
    [Required(ErrorMessage = "razorpay_order_id is required")]
    public string RazorpayOrderId { get; set; } = string.Empty;

    [Required(ErrorMessage = "razorpay_payment_id is required")]
    public string RazorpayPaymentId { get; set; } = string.Empty;

    [Required(ErrorMessage = "razorpay_signature is required")]
    public string RazorpaySignature { get; set; } = string.Empty;

    [Required(ErrorMessage = "Address is required")]
    // AddressId is optional: if the frontend omits it, the server will use the
    // user's default address (if any). Use Guid? so model binding accepts null.
    public Guid? AddressId { get; set; }
}

// POST /api/payments/verify response
public class VerifyPaymentResponseDto
{
    public Guid OrderId { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public string OrderStatus { get; set; } = string.Empty;
    public string PaymentId { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
}
