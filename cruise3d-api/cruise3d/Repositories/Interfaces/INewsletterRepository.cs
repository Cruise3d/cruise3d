using cruise3d.Models.Entities;

namespace cruise3d.API.Repositories.Interfaces
{
    public interface INewsletterRepository
    {
        Task<IEnumerable<NewsletterSubscriber>> GetAllAsync();
        Task<NewsletterSubscriber?> GetByIdAsync(Guid id);
        Task<NewsletterSubscriber?> GetByEmailAsync(string email);
        Task<NewsletterSubscriber> CreateAsync(NewsletterSubscriber subscriber);
        Task UpdateAsync(NewsletterSubscriber subscriber);
        Task DeleteAsync(Guid id);
        Task<bool> ExistsByEmailAsync(string email);
    }
}
