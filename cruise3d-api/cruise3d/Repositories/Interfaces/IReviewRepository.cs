using cruise3d.Models.Entities;

namespace cruise3d.API.Repositories.Interfaces
{
    public interface IReviewRepository
    {
        Task<(IEnumerable<Review> Items, int Total)> GetAllAsync(
            Guid? productId, int page, int pageSize);
        Task<Review?> GetByIdAsync(Guid id);
        Task<IEnumerable<Review>> GetByProductIdAsync(Guid productId);
        Task<IEnumerable<Review>> GetByCustomerIdAsync(Guid customerId);
        Task<Review> CreateAsync(Review review);
        Task UpdateAsync(Review review);
        Task DeleteAsync(Guid id);
        Task<double> GetAverageRatingByProductIdAsync(Guid productId);
        Task<int> GetCountByProductIdAsync(Guid productId);
    }
}
