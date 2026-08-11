using cruise3d.Models.Entities;

namespace cruise3d.API.Repositories.Interfaces
{
    public interface ITestimonialRepository
    {
        Task<(IEnumerable<Testimonial> Items, int Total)> GetAllAsync(int page, int pageSize);
        Task<Testimonial?> GetByIdAsync(Guid id);
        Task<IEnumerable<Testimonial>> GetFeaturedAsync();
        Task<Testimonial> CreateAsync(Testimonial testimonial);
        Task UpdateAsync(Testimonial testimonial);
        Task DeleteAsync(Guid id);
    }
}
