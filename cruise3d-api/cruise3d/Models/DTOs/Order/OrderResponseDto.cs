using System;
using System.Collections.Generic;

namespace cruise3d.API.Models.DTOs.Order;

public class OrderResponseDto
{
    public Guid Id { get; set; }
    public decimal Subtotal { get; set; }
    public decimal ShippingCharge { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public string? PaymentId { get; set; }
    public DateTime PlacedAt { get; set; }

    // Shipping address snapshot
    public OrderAddressDto Address { get; set; } = new OrderAddressDto();

    // Items
    public List<OrderItemResponseDto> Items { get; set; } = new List<OrderItemResponseDto>();
}

public class OrderAddressDto
{
    public string FullName { get; set; } = string.Empty;
    public string AddressLine { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Pincode { get; set; } = string.Empty;
}

public class OrderItemResponseDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductTitle { get; set; } = string.Empty;
    public string? ProductImageUrl { get; set; }
    public int Quantity { get; set; }
    public decimal PriceAtPurchase { get; set; }
    public decimal ItemTotal { get; set; }

    // Color snapshot — frozen at time of purchase
    public string? ColorName { get; set; }
    public string? ColorHex { get; set; }
}
