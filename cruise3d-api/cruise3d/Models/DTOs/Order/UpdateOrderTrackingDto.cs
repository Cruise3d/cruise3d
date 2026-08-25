namespace cruise3d.API.Models.DTOs.Order;

// Admin-only: assigns or updates the DTDC tracking ID on an order.
// Pass null to clear an existing tracking ID.
public class UpdateOrderTrackingDto
{
    public string? DtdcTrackingId { get; set; }
}
