using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using cruise3d.API.Data;
using cruise3d.API.Models.DTOs.Payment;
using cruise3d.API.Repositories.Interfaces;
using cruise3d.API.Services.Interfaces;
using cruise3d.Models.Entities;
using cruise3d.Models.Settings;
using Microsoft.Extensions.Http;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Razorpay.Api;
using PaymentEntity = cruise3d.Models.Entities.Payment;
using HttpMethod = System.Net.Http.HttpMethod;

namespace cruise3d.API.Services;

public class PaymentService : IPaymentService
{
    private readonly ICartRepository _carts;
    private readonly IProductRepository _products;
    private readonly IOrderRepository _orders;
    private readonly IPaymentRepository _payments;
    private readonly IOrderService _orderService;
    private readonly IAddressRepository _addresses;
    private readonly AppDbContext _db;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly RazorpayOptions _opts;

    public PaymentService(
        ICartRepository carts,
        IProductRepository products,
        IOrderRepository orders,
        IPaymentRepository payments,
        IOrderService orderService,
        IAddressRepository addresses,
        AppDbContext db,
        IHttpClientFactory httpClientFactory,
        IOptions<RazorpayOptions> opts)
    {
        _carts = carts;
        _products = products;
        _orders = orders;
        _payments = payments;
        _orderService = orderService;
        _addresses = addresses;
        _db = db;
        _httpClientFactory = httpClientFactory;
        _opts = opts.Value;
    }

    public async Task<CreateRazorpayOrderResponseDto> CreateRazorpayOrderAsync(Guid userId)
    {
        var cartItems = await _carts.GetByUserIdAsync(userId);
        if (!cartItems.Any())
            throw new Exception("Your cart is empty.");

        foreach (var item in cartItems)
        {
            var product = await _products.GetByIdAsync(item.ProductId)
                ?? throw new Exception("Product not found.");
            // If a product color override exists, use its stock; otherwise use product stock
            var availableStock = item.ProductColor?.StockOverride ?? product.Stock;
            if (availableStock < item.Quantity)
                throw new Exception($"Only {availableStock} units of '{product.Title}' available.");
        }

        const decimal ShippingCharge = 60m;
        var subtotal = cartItems.Sum(i => (i.Product?.Price ?? 0) * i.Quantity);
        var total = subtotal + ShippingCharge;
        var checkoutKey = CreateCheckoutKey(cartItems);
        var snapshotItems = cartItems.Select(i => new
        {
            CartId = i.Id,
            ProductId = i.ProductId,
            ProductColorId = i.ProductColorId,
            Quantity = i.Quantity,
            PriceAtPurchase = i.Product?.Price ?? 0,
            ColorNameSnapshot = i.ProductColor?.ColorName ?? i.Product?.DefaultColorName,
            ColorHexSnapshot = i.ProductColor?.ColorHex ?? i.Product?.DefaultColorHex
        }).ToList();

        // Create Razorpay order (amount in paise)
        var amountPaise = (int)Math.Round(total * 100m);

        await using var tx = await _db.Database.BeginTransactionAsync();
        await AcquireCheckoutLockAsync(checkoutKey);

        var existingIntent = await _payments.GetByUserAndCheckoutKeyAsync(userId, checkoutKey);
        if (existingIntent == null)
        {
            // Intents created before CheckoutKey was introduced can still be
            // matched by their stored cart snapshot.
            var legacyIntent = await _payments.GetLatestPendingByUserIdAsync(userId);
            if (legacyIntent != null && CartMatchesSnapshot(legacyIntent.CartSnapshot, cartItems))
                existingIntent = legacyIntent;
        }

        if (existingIntent != null &&
            existingIntent.Status != "failed" &&
            existingIntent.Status != "refunded")
        {
            await tx.CommitAsync();
            return CreateExistingIntentResponse(existingIntent, subtotal, ShippingCharge);
        }

        // Receipt must be <= 40 characters; use shortened GUID (first 12 chars) with prefix
        var shortId = Guid.NewGuid().ToString("N").Substring(0, 12);
        var requestBody = new Dictionary<string, object>
        {
            { "amount", amountPaise },
            { "currency", "INR" },
            { "receipt", $"rcpt_{shortId}" }
        };

        var httpClient = _httpClientFactory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.razorpay.com/v1/orders")
        {
            Content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json")
        };
        var credentials = Convert.ToBase64String(
            Encoding.UTF8.GetBytes($"{_opts.Key}:{_opts.Secret}"));
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue(
            "Basic", credentials);

        using var response = await httpClient.SendAsync(request);
        var responseBody = await response.Content.ReadAsStringAsync();
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException(
                $"Razorpay order creation failed with HTTP {(int)response.StatusCode}.");

        using var responseJson = JsonDocument.Parse(responseBody);
        if (!responseJson.RootElement.TryGetProperty("id", out var orderIdElement)
            || string.IsNullOrWhiteSpace(orderIdElement.GetString()))
            throw new InvalidOperationException("Razorpay returned an invalid order response.");

        var orderId = orderIdElement.GetString()!;

        var intent = new PaymentEntity
        {
            Id = Guid.NewGuid(),
            OrderId = null,
            UserId = userId,
            RazorpayOrderId = orderId,
            RazorpayPaymentId = null,
            CheckoutKey = checkoutKey,
            Amount = total,
            Currency = "INR",
            Provider = "razorpay",
            Status = "pending",
            CartSnapshot = JsonSerializer.Serialize(snapshotItems),
            CreatedAt = DateTime.UtcNow
        };

        await _payments.CreateAsync(intent);
        await tx.CommitAsync();

        return new CreateRazorpayOrderResponseDto
        {
            OrderId = orderId,
            Amount = amountPaise,
            Currency = "INR",
            Key = _opts.Key,
            CheckoutSummary = new CheckoutSummaryDto
            {
                Subtotal = subtotal,
                ShippingCharge = ShippingCharge,
                TotalAmount = total
            }
        };
    }

    private CreateRazorpayOrderResponseDto CreateExistingIntentResponse(
        PaymentEntity intent, decimal subtotal, decimal shippingCharge)
    {
        return new CreateRazorpayOrderResponseDto
        {
            OrderId = intent.RazorpayOrderId,
            Amount = (int)Math.Round(intent.Amount * 100m),
            Currency = intent.Currency,
            Key = _opts.Key,
            PaymentStatus = intent.Status,
            ApplicationOrderId = intent.OrderId,
            PaymentId = intent.RazorpayPaymentId,
            CheckoutSummary = new CheckoutSummaryDto
            {
                Subtotal = subtotal,
                ShippingCharge = shippingCharge,
                TotalAmount = intent.Amount
            }
        };
    }

    private static string CreateCheckoutKey(IEnumerable<Cart> cartItems)
    {
        var identity = string.Join("|", cartItems
            .OrderBy(i => i.Id)
            .Select(i => $"{i.Id:N}:{i.ProductId:N}:{i.ProductColorId?.ToString("N") ?? "none"}:{i.Quantity}"));
        using var sha = SHA256.Create();
        return Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(identity))).ToLowerInvariant();
    }

    private async Task AcquireCheckoutLockAsync(string checkoutKey)
    {
        var connection = _db.Database.GetDbConnection();
        await using var command = connection.CreateCommand();
        command.Transaction = _db.Database.CurrentTransaction?.GetDbTransaction();
        command.CommandText = "SELECT pg_advisory_xact_lock(hashtextextended(@checkout_key, 0));";
        var parameter = command.CreateParameter();
        parameter.ParameterName = "checkout_key";
        parameter.Value = checkoutKey;
        command.Parameters.Add(parameter);
        await command.ExecuteNonQueryAsync();
    }

    private static bool CartMatchesSnapshot(string? snapshotJson, IEnumerable<Cart> cartItems)
    {
        if (string.IsNullOrWhiteSpace(snapshotJson)) return false;
        try
        {
            var snapshot = JsonSerializer.Deserialize<List<CartSnapshotIdentity>>(snapshotJson);
            var current = cartItems
                .OrderBy(i => i.ProductId)
                .ThenBy(i => i.ProductColorId)
                .Select(i => (i.ProductId, i.ProductColorId, i.Quantity));
            var stored = snapshot?
                .OrderBy(i => i.ProductId)
                .ThenBy(i => i.ProductColorId)
                .Select(i => (i.ProductId, i.ProductColorId, i.Quantity));
            return stored != null && current.SequenceEqual(stored);
        }
        catch (JsonException)
        {
            return false;
        }
    }

    private sealed class CartSnapshotIdentity
    {
        public Guid ProductId { get; set; }
        public Guid? ProductColorId { get; set; }
        public int Quantity { get; set; }
    }

    public async Task<VerifyPaymentResponseDto> VerifyPaymentAsync(VerifyPaymentRequestDto dto, Guid userId)
    {
        var client = new RazorpayClient(_opts.Key, _opts.Secret);

        if (!VerifyRazorpaySignature(dto.RazorpayOrderId, dto.RazorpayPaymentId, dto.RazorpaySignature, _opts.Secret))
            throw new Exception("Invalid signature.");

        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            var intent = await _payments.GetByRazorpayOrderIdAsync(dto.RazorpayOrderId)
                ?? throw new Exception("Payment intent not found.");

            if (intent.UserId != userId) throw new Exception("Payment intent does not belong to user.");

            if (intent.Status == "paid")
            {
                if (!intent.OrderId.HasValue)
                    throw new Exception("Payment already processed.");

                var existingOrder = await _orders.GetByIdAsync(intent.OrderId.Value)
                    ?? throw new Exception("Payment already processed but order not found.");

                await tx.CommitAsync();
                return new VerifyPaymentResponseDto
                {
                    OrderId = existingOrder.Id,
                    PaymentStatus = intent.Status,
                    OrderStatus = existingOrder.Status,
                    PaymentId = intent.RazorpayPaymentId ?? dto.RazorpayPaymentId,
                    TotalAmount = existingOrder.TotalAmount
                };
            }

            if (!string.IsNullOrEmpty(intent.RazorpayPaymentId) &&
                !string.Equals(intent.RazorpayPaymentId, dto.RazorpayPaymentId, StringComparison.OrdinalIgnoreCase))
            {
                throw new Exception("Payment already processed.");
            }

            // Verify the paid amount matches the intent
            var fetched = client.Payment.Fetch(dto.RazorpayPaymentId);
            var paidAmountPaise = int.Parse(fetched["amount"].ToString() ?? "0");
            var intentAmountPaise = (int)Math.Round(intent.Amount * 100m);
            if (paidAmountPaise != intentAmountPaise)
                throw new Exception("Payment amount mismatch.");

            // Resolve address: use provided AddressId if present; otherwise use the
            // user's default address. Throw if no address is available.
            Guid resolvedAddressId;
            Address address;
            if (!dto.AddressId.HasValue || dto.AddressId == Guid.Empty)
            {
                address = await _addresses.GetDefaultByUserIdAsync(userId)
                    ?? throw new Exception("Address is required.");
                resolvedAddressId = address.Id;
            }
            else
            {
                address = await _addresses.GetByIdAsync(dto.AddressId.Value)
                    ?? throw new Exception("Address not found.");
                if (address.UserId != userId) throw new Exception("Address does not belong to the user.");
                resolvedAddressId = address.Id;
            }

            // Persist the gateway payment id before order creation so the order
            // snapshot carries the verified payment reference.
            intent.RazorpayPaymentId = dto.RazorpayPaymentId;

            // Create order from the stored snapshot
            var orderResp = await _orderService.CreateOrderFromPaymentIntentAsync(userId, intent, resolvedAddressId);

            // Update payment record
            intent.OrderId = orderResp.Id;
            intent.Status = "paid";
            await _payments.UpdateAsync(intent);

            // Mark transaction complete
            await tx.CommitAsync();

            return new VerifyPaymentResponseDto
            {
                OrderId = orderResp.Id,
                PaymentStatus = "paid",
                OrderStatus = orderResp.Status,
                PaymentId = dto.RazorpayPaymentId,
                TotalAmount = orderResp.TotalAmount
            };
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    private static bool VerifyRazorpaySignature(string orderId, string paymentId, string signature, string secret)
    {
        if (string.IsNullOrEmpty(orderId) || string.IsNullOrEmpty(paymentId) || string.IsNullOrEmpty(signature))
            return false;

        var payload = string.Concat(orderId, "|", paymentId);
        var keyBytes = Encoding.UTF8.GetBytes(secret ?? string.Empty);
        using var hmac = new HMACSHA256(keyBytes);
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        var computed = BitConverter.ToString(hash).Replace("-", string.Empty).ToLowerInvariant();
        // Razorpay signature may be hex; compare case-insensitive
        return string.Equals(computed, signature, StringComparison.OrdinalIgnoreCase);
    }

    public Task<bool> TestRazorpayConnectionAsync()
    {
        try
        {
            var client = new RazorpayClient(_opts.Key, _opts.Secret);
            // Attempt a harmless list request; if credentials are invalid this will throw
            client.Order.All(new Dictionary<string, object> { { "count", 1 } });
            return Task.FromResult(true);
        }
        catch (Exception)
        {
            return Task.FromResult(false);
        }
    }
}
