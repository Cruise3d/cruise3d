namespace cruise3d.API.Models.DTOs.Payment;

// POST /api/payments/create-order response
// Returned to the frontend so it can open Razorpay Checkout.
public class CreateRazorpayOrderResponseDto
{
    public string OrderId { get; set; } = string.Empty;
    public int Amount { get; set; }      // amount in paise (smallest currency unit)
    public string Currency { get; set; } = "INR";
    public string Key { get; set; } = string.Empty;
    public CheckoutSummaryDto? CheckoutSummary { get; set; }
}

// Snapshot of cart totals returned with the Razorpay order so the
// frontend can show a checkout summary while payment is in progress.
public class CheckoutSummaryDto
{
    public decimal Subtotal { get; set; }
    public decimal ShippingCharge { get; set; }
    public decimal TotalAmount { get; set; }
}
