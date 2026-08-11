using cruise3d.API.Models.DTOs.Order;
using cruise3d.Models.Entities;
using cruise3d.API.Repositories.Interfaces;
using cruise3d.API.Services.Interfaces;
using System.Text.Json;

namespace cruise3d.API.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository  _orders;
    private readonly ICartRepository   _carts;
    private readonly IProductRepository _products;

    private const decimal ShippingCharge = 60m; // ₹60 flat shipping

    public OrderService(
        IOrderRepository orders,
        ICartRepository carts,
        IProductRepository products)
    {
        _orders   = orders;
        _carts    = carts;
        _products = products;
    }

    // ─── PLACE ORDER ─────────────────────────────────────────────────────────
    public async Task<OrderResponseDto> PlaceOrderAsync(
        Guid customerId, PlaceOrderDto dto)
    {
        // 1. Get customer's cart
        var cartItems = await _carts.GetByUserIdAsync(customerId);
        if (!cartItems.Any())
            throw new Exception("Your cart is empty.");

        // 2. Validate stock for every item
        foreach (var item in cartItems)
        {
            var product = await _products.GetByIdAsync(item.ProductId)
                ?? throw new Exception($"Product '{item.Product?.Title}' no longer exists.");

            if (product.Stock < item.Quantity)
                throw new Exception(
                    $"Only {product.Stock} units of '{product.Title}' available.");
        }

        // 3. Calculate totals
        var subtotal = cartItems.Sum(i => (i.Product?.Price ?? 0) * i.Quantity);
        var total    = subtotal + ShippingCharge;

        // 4. Build order
        var order = new Order
        {
            Id              = Guid.NewGuid(),
            CustomerId      = customerId,
            AddressId       = dto.AddressId,
            Subtotal        = subtotal,
            ShippingCharge  = ShippingCharge,
            TotalAmount     = total,
            Status          = "pending",
            // Never trust a paymentId coming from the client for gateway providers.
            // For Razorpay, orders created via the public /api/orders endpoint remain unpaid.
            PaymentStatus   = dto.PaymentProvider?.ToLowerInvariant() == "cod" ? "pending" : "unpaid",
            PaymentId       = null,
            PaymentProvider = dto.PaymentProvider,
            PlacedAt        = DateTime.UtcNow,
            UpdatedAt       = DateTime.UtcNow
        };

        // 5. Build order items — snapshot price and color at purchase time
        order.Items = cartItems.Select(item => new OrderItem
        {
            Id                  = Guid.NewGuid(),
            OrderId             = order.Id,
            ProductId           = item.ProductId,
            ProductColorId      = item.ProductColorId,
            ColorNameSnapshot   = item.ProductColor?.ColorName
                                    ?? item.Product?.DefaultColorName,
            ColorHexSnapshot    = item.ProductColor?.ColorHex
                                    ?? item.Product?.DefaultColorHex,
            Quantity            = item.Quantity,
            PriceAtPurchase     = item.Product?.Price ?? 0
        }).ToList();

        // 6. Save order to database
        await _orders.CreateAsync(order);

        // 7. Deduct stock for each product
        foreach (var item in cartItems)
        {
            var prod = await _products.GetByIdAsync(item.ProductId)
                ?? throw new Exception("Product not found.");
            prod.Stock -= item.Quantity;
            if (prod.Stock < 0) prod.Stock = 0;
            await _products.UpdateAsync(prod);
        }

        // 8. Clear the cart
        await _carts.DeleteByUserIdAsync(customerId);

        return MapToResponse(order);
    }

    // ─── MY ORDERS ───────────────────────────────────────────────────────────
    public async Task<IEnumerable<OrderResponseDto>> GetMyOrdersAsync(Guid customerId)
    {
        var orders = await _orders.GetByCustomerIdAsync(customerId);
        return orders.Select(MapToResponse);
    }

    // ─── GET ORDER BY ID ─────────────────────────────────────────────────────
    public async Task<OrderResponseDto> GetByIdAsync(Guid orderId, Guid customerId)
    {
        var order = await _orders.GetByIdAsync(orderId)
            ?? throw new Exception("Order not found.");

        // Customer can only see their own orders
        if (order.CustomerId != customerId)
            throw new Exception("Unauthorized.");

        return MapToResponse(order);
    }

    // ─── ADMIN: GET ALL ORDERS ────────────────────────────────────────────────
    public async Task<(IEnumerable<OrderResponseDto> Items, int Total)>
        GetAllOrdersAsync(string? status, int page, int pageSize)
    {
        var (orders, total) = await _orders.GetAllAsync(null, status, page, pageSize);
        return (orders.Select(MapToResponse), total);
    }

    // ─── ADMIN: UPDATE ORDER STATUS ───────────────────────────────────────────
    public async Task<OrderResponseDto> UpdateStatusAsync(Guid orderId, string status)
    {
        var validStatuses = new[]
        {
            "pending", "confirmed", "printing",
            "shipped", "delivered", "cancelled"
        };

        if (!validStatuses.Contains(status))
            throw new Exception($"Invalid status '{status}'.");

        var order = await _orders.GetByIdAsync(orderId)
            ?? throw new Exception("Order not found.");

        // If cancelling, restore stock
        if (status == "cancelled" && order.Status != "cancelled")
        {
            foreach (var item in order.Items)
            {
                var prod = await _products.GetByIdAsync(item.ProductId);
                if (prod != null)
                {
                    prod.Stock += item.Quantity;
                    await _products.UpdateAsync(prod);
                }
            }
        }

        order.Status    = status;
        order.UpdatedAt = DateTime.UtcNow;

        await _orders.UpdateAsync(order);
        return MapToResponse(order);
    }

    // ─── MAPPING HELPER ───────────────────────────────────────────────────────
    private static OrderResponseDto MapToResponse(Order o) => new()
    {
        Id             = o.Id,
        Subtotal       = o.Subtotal,
        ShippingCharge = o.ShippingCharge,
        TotalAmount    = o.TotalAmount,
        Status         = o.Status,
        PaymentStatus  = o.PaymentStatus,
        PaymentId      = o.PaymentId,
        PlacedAt       = o.PlacedAt,
        Address = new OrderAddressDto
        {
            FullName    = o.Address?.FullName    ?? string.Empty,
            AddressLine = o.Address?.AddressLine ?? string.Empty,
            City        = o.Address?.City        ?? string.Empty,
            State       = o.Address?.State       ?? string.Empty,
            Pincode     = o.Address?.Pincode     ?? string.Empty
        },
        Items = o.Items.Select(i => new OrderItemResponseDto
        {
            Id              = i.Id,
            ProductId       = i.ProductId,
            ProductTitle    = i.Product?.Title ?? string.Empty,
            ProductImageUrl = i.Product?.Images
                                .Where(img => img.IsPrimary)
                                .FirstOrDefault()?.Url,
            Quantity        = i.Quantity,
            PriceAtPurchase = i.PriceAtPurchase,
            ItemTotal       = i.PriceAtPurchase * i.Quantity,
            ColorName       = i.ColorNameSnapshot,
            ColorHex        = i.ColorHexSnapshot
        }).ToList()
    };

    // Create an order from a stored payment intent (server-side verified)
    public async Task<OrderResponseDto> CreateOrderFromPaymentIntentAsync(Guid customerId, cruise3d.Models.Entities.Payment paymentIntent, Guid addressId)
    {
        if (paymentIntent == null) throw new Exception("Payment intent not found.");
        if (paymentIntent.UserId != customerId) throw new Exception("Unauthorized.");
        if (string.IsNullOrEmpty(paymentIntent.CartSnapshot)) throw new Exception("Payment intent has no cart snapshot.");

        // Deserialize snapshot
        var snapshot = JsonSerializer.Deserialize<List<CartSnapshotItem>>(paymentIntent.CartSnapshot)
            ?? throw new Exception("Invalid cart snapshot.");

        if (!snapshot.Any()) throw new Exception("Your cart is empty.");

        // Validate stock
        foreach (var item in snapshot)
        {
            var product = await _products.GetByIdAsync(item.ProductId)
                ?? throw new Exception($"Product no longer exists.");
            if (product.Stock < item.Quantity)
                throw new Exception($"Only {product.Stock} units of '{product.Title}' available.");
        }

        // Calculate totals from snapshot
        var subtotal = snapshot.Sum(i => i.PriceAtPurchase * i.Quantity);
        var total = subtotal + ShippingCharge;

        var order = new Order
        {
            Id = Guid.NewGuid(),
            CustomerId = customerId,
            AddressId = addressId,
            Subtotal = subtotal,
            ShippingCharge = ShippingCharge,
            TotalAmount = total,
            Status = "pending",
            PaymentStatus = "paid",
            PaymentId = paymentIntent.RazorpayPaymentId,
            PaymentProvider = paymentIntent.Provider,
            RazorpayOrderId = paymentIntent.RazorpayOrderId,
            RazorpayPaymentId = paymentIntent.RazorpayPaymentId,
            PlacedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        order.Items = snapshot.Select(item => new OrderItem
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            ProductId = item.ProductId,
            ProductColorId = item.ProductColorId,
            ColorNameSnapshot = item.ColorNameSnapshot,
            ColorHexSnapshot = item.ColorHexSnapshot,
            Quantity = item.Quantity,
            PriceAtPurchase = item.PriceAtPurchase
        }).ToList();

        // Save order
        await _orders.CreateAsync(order);

        // Deduct stock
        foreach (var item in snapshot)
        {
            var prod = await _products.GetByIdAsync(item.ProductId);
            if (prod != null)
            {
                prod.Stock -= item.Quantity;
                if (prod.Stock < 0) prod.Stock = 0;
                await _products.UpdateAsync(prod);
            }
        }

        // Clear cart for the user
        await _carts.DeleteByUserIdAsync(customerId);

        return MapToResponse(order);
    }

    private class CartSnapshotItem
    {
        public Guid ProductId { get; set; }
        public Guid? ProductColorId { get; set; }
        public int Quantity { get; set; }
        public decimal PriceAtPurchase { get; set; }
        public string? ColorNameSnapshot { get; set; }
        public string? ColorHexSnapshot { get; set; }
    }
}

