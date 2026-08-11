using cruise3d.API.Helpers;
using cruise3d.API.Models.DTOs.Cart;
using cruise3d.API.Models.DTOs.Common;
using cruise3d.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace cruise3d.API.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize(Roles = "customer")]   // entire controller — customers only
public class CartController : ControllerBase
{
    private readonly ICartService _cart;

    public CartController(ICartService cart)
        => _cart = cart;

    // GET api/cart
    // Get logged-in customer's cart
    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var userId = JwtHelper.GetUserId(User);
        var result = await _cart.GetCartAsync(userId);
        return Ok(ApiResponse<CartResponseDto>.Ok(result));
    }

    // POST api/cart
    // Add item to cart
    [HttpPost]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
    {
        var userId = JwtHelper.GetUserId(User);
        var result = await _cart.AddToCartAsync(userId, dto);
        return Ok(ApiResponse<CartResponseDto>.Ok(result, "Item added to cart."));
    }

    // PUT api/cart/{cartId}
    // Update quantity of a cart item
    [HttpPut("{cartId}")]
    public async Task<IActionResult> UpdateQuantity(
        Guid cartId, [FromBody] UpdateQuantityDto dto)
    {
        var userId = JwtHelper.GetUserId(User);
        var result = await _cart.UpdateQuantityAsync(userId, cartId, dto.Quantity);
        return Ok(ApiResponse<CartResponseDto>.Ok(result, "Cart updated."));
    }

    // DELETE api/cart/{cartId}
    // Remove a specific item from cart
    [HttpDelete("{cartId}")]
    public async Task<IActionResult> RemoveItem(Guid cartId)
    {
        var userId = JwtHelper.GetUserId(User);
        var result = await _cart.RemoveItemAsync(userId, cartId);
        return Ok(ApiResponse<CartResponseDto>.Ok(result, "Item removed from cart."));
    }

    // DELETE api/cart
    // Clear entire cart
    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        var userId = JwtHelper.GetUserId(User);
        await _cart.ClearCartAsync(userId);
        return Ok(ApiResponse<string>.Ok("Cart cleared."));
    }
}

public class UpdateQuantityDto
{
    public int Quantity { get; set; }
}

