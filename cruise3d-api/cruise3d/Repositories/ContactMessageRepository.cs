using cruise3d.API.Data;
using cruise3d.API.Repositories.Interfaces;
using cruise3d.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace cruise3d.API.Repositories;

public class ContactMessageRepository : IContactMessageRepository
{
    private readonly AppDbContext _db;

    public ContactMessageRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<ContactMessage>> GetAllAsync()
    {
        return await _db.ContactMessages
            .OrderByDescending(message => message.CreatedAt)
            .ToListAsync();
    }

    public async Task<ContactMessage> CreateAsync(ContactMessage contactMessage)
    {
        _db.ContactMessages.Add(contactMessage);
        await _db.SaveChangesAsync();
        return contactMessage;
    }
}
