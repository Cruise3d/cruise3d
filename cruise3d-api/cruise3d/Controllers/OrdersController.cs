using cruise3d.API.Helpers;
using cruise3d.API.Models.DTOs.Common;
using cruise3d.API.Models.DTOs.Order;
using cruise3d.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace cruise3d.API.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orders;

    public OrdersController(IOrderService orders)
        => _orders = orders;

    // POST api/orders
    // Customer places an order from their cart
    [HttpPost]
    [Authorize(Roles = "customer")]
    public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderDto dto)
    {
        var customerId = JwtHelper.GetUserId(User);
        var result     = await _orders.PlaceOrderAsync(customerId, dto);
        return Ok(ApiResponse<OrderResponseDto>.Ok(result, "Order placed successfully."));
    }

    // GET api/orders/my
    // Customer views their own order history
    [HttpGet("my")]
    [Authorize(Roles = "customer")]
    public async Task<IActionResult> GetMyOrders()
    {
        var customerId = JwtHelper.GetUserId(User);
        var result     = await _orders.GetMyOrdersAsync(customerId);
        return Ok(ApiResponse<object>.Ok(result));
    }

    // GET api/orders/my/{orderId}
    // Customer views a specific order detail + tracking status
    [HttpGet("my/{orderId}")]
    [Authorize(Roles = "customer")]
    public async Task<IActionResult> GetMyOrder(Guid orderId)
    {
        var customerId = JwtHelper.GetUserId(User);
        var result     = await _orders.GetByIdAsync(orderId, customerId);
        return Ok(ApiResponse<OrderResponseDto>.Ok(result));
    }

    // GET api/orders
    // Admin views all orders with optional status filter
    // Example: GET api/orders?status=pending&page=1&pageSize=20
    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAllOrders(
        [FromQuery] string? status,
        [FromQuery] int page     = 1,
        [FromQuery] int pageSize = 20)
    {
        var (items, total) = await _orders.GetAllOrdersAsync(status, page, pageSize);

        var result = new
        {
            Items      = items,
            Total      = total,
            Page       = page,
            PageSize   = pageSize,
            TotalPages = (int)Math.Ceiling((double)total / pageSize)
        };

        return Ok(ApiResponse<object>.Ok(result));
    }

    // PUT api/orders/{orderId}/status
    // Admin updates order status
    // Body: { "status": "confirmed" }
    [HttpPut("{orderId}/status")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateStatus(
        Guid orderId, [FromBody] UpdateOrderStatusDto dto)
    {
        var result = await _orders.UpdateStatusAsync(orderId, dto.Status);
        return Ok(ApiResponse<OrderResponseDto>.Ok(result, "Order status updated."));
    }
}

public class UpdateOrderStatusDto
{
    public string Status { get; set; } = string.Empty;
}

