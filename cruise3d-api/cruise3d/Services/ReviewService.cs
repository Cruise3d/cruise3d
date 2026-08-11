using cruise3d.Models.Entities;
using cruise3d.API.Repositories.Interfaces;
using cruise3d.API.Services.Interfaces;

namespace cruise3d.API.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository  _reviews;
    private readonly IOrderRepository   _orders;
    private readonly IProductRepository _products;

    public ReviewService(
        IReviewRepository reviews,
        IOrderRepository orders,
        IProductRepository products)
    {
        _reviews  = reviews;
        _orders   = orders;
        _products = products;
    }

    public async Task<IEnumerable<Review>> GetByProductAsync(Guid productId)
        => await _reviews.GetByProductIdAsync(productId);

    public async Task<Review> CreateAsync(Guid customerId, Guid productId,
        Guid orderId, int rating, string? comment)
    {
        // 1. Validate product exists
        var product = await _products.GetByIdAsync(productId)
            ?? throw new Exception("Product not found.");

        // 2. Validate order belongs to customer and contains this product
        var order = await _orders.GetByIdAsync(orderId)
            ?? throw new Exception("Order not found.");

        if (order.CustomerId != customerId)
            throw new Exception("Unauthorized.");

        var orderedProduct = order.Items.Any(i => i.ProductId == productId);
        if (!orderedProduct)
            throw new Exception("You can only review products you have purchased.");

        // 3. Check order is delivered
        if (order.Status != "delivered")
            throw new Exception("You can only review products after delivery.");

        // 4. Check not already reviewed
        var customerReviews = await _reviews.GetByCustomerIdAsync(customerId);
        if (customerReviews.Any(r => r.ProductId == productId))
            throw new Exception("You have already reviewed this product.");

        // 5. Create review
        var review = new Review
        {
            Id         = Guid.NewGuid(),
            ProductId  = productId,
            CustomerId = customerId,
            OrderId    = orderId,
            Rating     = rating,
            Comment    = comment,
            CreatedAt  = DateTime.UtcNow
        };

        return await _reviews.CreateAsync(review);
    }

    public async Task DeleteAsync(Guid reviewId, Guid customerId)
    {
        var review = await _reviews.GetByIdAsync(reviewId)
            ?? throw new Exception("Review not found.");

        // Only the customer who wrote it can delete it
        if (review.CustomerId != customerId)
            throw new Exception("Unauthorized.");

        await _reviews.DeleteAsync(reviewId);
    }
}
