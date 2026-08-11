using cruise3d.API.Models.DTOs.Cart;
using cruise3d.Models.Entities;
using cruise3d.API.Repositories.Interfaces;
using cruise3d.API.Services.Interfaces;

namespace cruise3d.API.Services;

public class CartService : ICartService
{
    private readonly ICartRepository _carts;
    private readonly IProductRepository _products;

    public CartService(ICartRepository carts, IProductRepository products)
    {
        _carts    = carts;
        _products = products;
    }

    // ─── GET CART ─────────────────────────────────────────────────────────────
    public async Task<CartResponseDto> GetCartAsync(Guid userId)
    {
        var items = await _carts.GetByUserIdAsync(userId);
        return BuildCartResponse(items);
    }

    // ─── ADD TO CART ──────────────────────────────────────────────────────────
    public async Task<CartResponseDto> AddToCartAsync(Guid userId, AddToCartDto dto)
    {
        // 1. Check product exists
        var product = await _products.GetByIdAsync(dto.ProductId)
            ?? throw new Exception("Product not found.");

        // 2. Check product is in stock
        if (product.Stock <= 0)
            throw new Exception("Product is out of stock.");

        // 3. Validate color selection
        if (product.ColorType == "custom" && dto.ProductColorId == null)
            throw new Exception("Please select a color for this product.");

        if (product.ColorType == "fixed" && dto.ProductColorId != null)
            throw new Exception("This product does not support color selection.");

        // 4. Check if color exists for this product
        if (dto.ProductColorId != null)
        {
            var colorExists = product.Colors.Any(c => c.Id == dto.ProductColorId);
            if (!colorExists)
                throw new Exception("Selected color is not available for this product.");
        }

        // 5. Add or update cart item
        var existingItem = await _carts.GetByUserAndProductAsync(
            userId, dto.ProductId, dto.ProductColorId);

        if (existingItem != null)
        {
            // Item already in cart — just increase quantity
            existingItem.Quantity += dto.Quantity;
            await _carts.UpdateAsync(existingItem);
        }
        else
        {
            // New cart item
            var cartItem = new Cart
            {
                Id             = Guid.NewGuid(),
                UserId         = userId,
                ProductId      = dto.ProductId,
                ProductColorId = dto.ProductColorId,
                Quantity       = dto.Quantity,
                AddedAt        = DateTime.UtcNow
            };
            await _carts.CreateAsync(cartItem);
        }

        // 6. Return updated cart
        var updatedCart = await _carts.GetByUserIdAsync(userId);
        return BuildCartResponse(updatedCart);
    }

    // ─── UPDATE QUANTITY ──────────────────────────────────────────────────────
    public async Task<CartResponseDto> UpdateQuantityAsync(
        Guid userId, Guid cartId, int quantity)
    {
        var item = await _carts.GetByIdAsync(cartId)
            ?? throw new Exception("Cart item not found.");

        // Make sure this cart item belongs to this user
        if (item.UserId != userId)
            throw new Exception("Unauthorized.");

        if (quantity <= 0)
        {
            // If quantity is 0 or less, remove the item
            await _carts.DeleteAsync(cartId);
        }
        else
        {
            // Check stock availability
            var product = await _products.GetByIdAsync(item.ProductId)
                ?? throw new Exception("Product not found.");

            if (quantity > product.Stock)
                throw new Exception($"Only {product.Stock} units available.");

            item.Quantity = quantity;
            await _carts.UpdateAsync(item);
        }

        var updatedCart = await _carts.GetByUserIdAsync(userId);
        return BuildCartResponse(updatedCart);
    }

    // ─── REMOVE ITEM ──────────────────────────────────────────────────────────
    public async Task<CartResponseDto> RemoveItemAsync(Guid userId, Guid cartId)
    {
        var item = await _carts.GetByIdAsync(cartId)
            ?? throw new Exception("Cart item not found.");

        if (item.UserId != userId)
            throw new Exception("Unauthorized.");

            await _carts.DeleteAsync(cartId);

        var updatedCart = await _carts.GetByUserIdAsync(userId);
        return BuildCartResponse(updatedCart);
    }

    // ─── CLEAR CART ───────────────────────────────────────────────────────────
    public async Task ClearCartAsync(Guid userId)
        => await _carts.DeleteByUserIdAsync(userId);

    // ─── BUILD RESPONSE ───────────────────────────────────────────────────────
    private static CartResponseDto BuildCartResponse(IEnumerable<Cart> items)
    {
        var cartItems = items.Select(item => new CartItemResponseDto
        {
            Id             = item.Id,
            ProductId      = item.ProductId,
            ProductTitle   = item.Product?.Title ?? string.Empty,
            ProductImageUrl = item.Product?.Images
                                .Where(i => i.IsPrimary)
                                .FirstOrDefault()?.Url,
            Price          = item.Product?.Price ?? 0,
            Quantity       = item.Quantity,
            ItemTotal      = (item.Product?.Price ?? 0) * item.Quantity,
            ProductColorId = item.ProductColorId,
            ColorName      = item.ProductColor?.ColorName,
            ColorHex       = item.ProductColor?.ColorHex,
            AvailableStock = item.Product?.Stock ?? 0
        }).ToList();

        return new CartResponseDto
        {
            Items      = cartItems,
            Subtotal   = cartItems.Sum(i => i.ItemTotal),
            TotalItems = cartItems.Sum(i => i.Quantity)
        };
    }
}

