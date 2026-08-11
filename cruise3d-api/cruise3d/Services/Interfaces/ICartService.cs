using cruise3d.API.Models.DTOs.Cart;

namespace cruise3d.API.Services.Interfaces;

public interface ICartService
{
    Task<CartResponseDto> GetCartAsync(Guid userId);
    Task<CartResponseDto> AddToCartAsync(Guid userId, AddToCartDto dto);
    Task<CartResponseDto> UpdateQuantityAsync(Guid userId, Guid cartId, int quantity);
    Task<CartResponseDto> RemoveItemAsync(Guid userId, Guid cartId);
    Task ClearCartAsync(Guid userId);
}

