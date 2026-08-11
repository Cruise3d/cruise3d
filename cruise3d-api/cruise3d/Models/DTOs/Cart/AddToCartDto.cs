using System.ComponentModel.DataAnnotations;

namespace cruise3d.API.Models.DTOs.Cart;

public class AddToCartDto
{
    [Required(ErrorMessage = "Product is required")]
    public Guid ProductId { get; set; }

    // Required only when product ColorType = "custom"
    public Guid? ProductColorId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
    public int Quantity { get; set; } = 1;
}
