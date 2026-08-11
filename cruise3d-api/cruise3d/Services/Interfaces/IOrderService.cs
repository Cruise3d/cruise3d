using cruise3d.API.Models.DTOs.Order;

namespace cruise3d.API.Services.Interfaces;

public interface IOrderService
{
    // Customer
    Task<OrderResponseDto> PlaceOrderAsync(Guid customerId, PlaceOrderDto dto);
    Task<IEnumerable<OrderResponseDto>> GetMyOrdersAsync(Guid customerId);
    Task<OrderResponseDto> GetByIdAsync(Guid orderId, Guid customerId);

    // Admin
    Task<(IEnumerable<OrderResponseDto> Items, int Total)> GetAllOrdersAsync(
        string? status, int page, int pageSize);
    Task<OrderResponseDto> UpdateStatusAsync(Guid orderId, string status);

    // Create an order from a persisted payment intent (server-side verified).
    Task<OrderResponseDto> CreateOrderFromPaymentIntentAsync(Guid customerId, cruise3d.Models.Entities.Payment paymentIntent, Guid addressId);
}

