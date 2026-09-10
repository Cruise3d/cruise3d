using cruise3d.Models.Entities;

namespace cruise3d.API.Repositories.Interfaces;

public interface IContactMessageRepository
{
    Task<IEnumerable<ContactMessage>> GetAllAsync();
    Task<ContactMessage> CreateAsync(ContactMessage contactMessage);
}
