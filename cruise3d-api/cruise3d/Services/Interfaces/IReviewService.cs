using cruise3d.API.Models.DTOs.Review;

namespace cruise3d.API.Services.Interfaces;

public interface IReviewService
{
    Task<IEnumerable<ReviewResponseDto>> GetByProductAsync(Guid productId);
    Task<ReviewResponseDto> CreateAsync(Guid customerId, Guid productId, Guid orderId,
        int rating, string? comment);
    Task DeleteAsync(Guid reviewId, Guid customerId);
}
