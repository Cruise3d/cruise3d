using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using cruise3d.Models.Entities;
using cruise3d.API.Repositories.Interfaces;
using cruise3d.API.Data;
using Microsoft.EntityFrameworkCore;

namespace cruise3d.API.Repositories
{
    public class NewsletterRepository : INewsletterRepository
    {
        private readonly AppDbContext _db;

        public NewsletterRepository(AppDbContext db) => _db = db;

        public async Task<IEnumerable<NewsletterSubscriber>> GetAllAsync()
        {
            return await _db.NewsletterSubscribers
                .OrderByDescending(n => n.SubscribedAt)
                .ToListAsync();
        }

        public async Task<NewsletterSubscriber?> GetByIdAsync(Guid id)
        {
            return await _db.NewsletterSubscribers.FindAsync(id);
        }

        public async Task<NewsletterSubscriber?> GetByEmailAsync(string email)
        {
            return await _db.NewsletterSubscribers
                .FirstOrDefaultAsync(n => n.Email == email);
        }

        public async Task<NewsletterSubscriber> CreateAsync(NewsletterSubscriber subscriber)
        {
            _db.NewsletterSubscribers.Add(subscriber);
            await _db.SaveChangesAsync();
            return subscriber;
        }

        public async Task UpdateAsync(NewsletterSubscriber subscriber)
        {
            _db.NewsletterSubscribers.Update(subscriber);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var subscriber = await _db.NewsletterSubscribers.FindAsync(id);
            if (subscriber != null)
            {
                _db.NewsletterSubscribers.Remove(subscriber);
                await _db.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsByEmailAsync(string email)
        {
            return await _db.NewsletterSubscribers
                .AnyAsync(n => n.Email == email);
        }
    }
}
