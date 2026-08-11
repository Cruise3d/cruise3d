using System.ComponentModel.DataAnnotations;

namespace cruise3d.API.Models.DTOs.Order;

public class PlaceOrderDto
{
    [Required(ErrorMessage = "Address is required")]
    public Guid AddressId { get; set; }

    [Required(ErrorMessage = "Payment provider is required")]
    public string PaymentProvider { get; set; } = "razorpay";

    // Razorpay payment ID after successful payment on frontend
    public string? PaymentId { get; set; }
}
