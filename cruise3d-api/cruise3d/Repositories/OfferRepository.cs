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
    public class OfferRepository : IOfferRepository
    {
        private readonly AppDbContext _db;

        public OfferRepository(AppDbContext db) => _db = db;

        public async Task<IEnumerable<Offer>> GetAllAsync()
        {
            return await _db.Offers
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<Offer?> GetByIdAsync(Guid id)
        {
            return await _db.Offers.FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<Offer?> GetActiveAsync()
        {
            var now = DateTime.UtcNow;
            return await _db.Offers
                .Where(o => o.IsActive && o.StartDate <= now && o.EndDate >= now)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<Offer> CreateAsync(Offer offer)
        {
            _db.Offers.Add(offer);
            await _db.SaveChangesAsync();
            return offer;
        }

        public async Task UpdateAsync(Offer offer)
        {
            _db.Offers.Update(offer);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var offer = await _db.Offers.FindAsync(id);
            if (offer != null)
            {
                _db.Offers.Remove(offer);
                await _db.SaveChangesAsync();
            }
        }
    }
}
