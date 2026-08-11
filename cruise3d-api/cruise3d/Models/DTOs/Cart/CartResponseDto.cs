using System.Collections.Generic;

namespace cruise3d.API.Models.DTOs.Cart;

public class CartResponseDto
{
    public List<CartItemResponseDto> Items { get; set; } = new List<CartItemResponseDto>();
    public decimal Subtotal { get; set; }
    public int TotalItems { get; set; }
}

public class CartItemResponseDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductTitle { get; set; } = string.Empty;
    public string? ProductImageUrl { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public decimal ItemTotal { get; set; }

    // Color info
    public Guid? ProductColorId { get; set; }
    public string? ColorName { get; set; }
    public string? ColorHex { get; set; }

    // Stock check
    public int AvailableStock { get; set; }
}
