using cruise3d.Models.Entities;

namespace cruise3d.API.Services.Interfaces;

public interface IReviewService
{
    Task<IEnumerable<Review>> GetByProductAsync(Guid productId);
    Task<Review> CreateAsync(Guid customerId, Guid productId, Guid orderId,
        int rating, string? comment);
    Task DeleteAsync(Guid reviewId, Guid customerId);
}
