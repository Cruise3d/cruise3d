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
    public class TestimonialRepository : ITestimonialRepository
    {
        private readonly AppDbContext _db;

        public TestimonialRepository(AppDbContext db) => _db = db;

        public async Task<(IEnumerable<Testimonial> Items, int Total)> GetAllAsync(int page, int pageSize)
        {
            var query = _db.Testimonials
                .Include(t => t.Customer)
                .AsQueryable();

            query = query.OrderByDescending(t => t.CreatedAt);

            var total = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, total);
        }

        public async Task<Testimonial?> GetByIdAsync(Guid id)
        {
            return await _db.Testimonials
                .Include(t => t.Customer)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<IEnumerable<Testimonial>> GetFeaturedAsync()
        {
            return await _db.Testimonials
                .Include(t => t.Customer)
                .Where(t => t.IsFeatured)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<Testimonial> CreateAsync(Testimonial testimonial)
        {
            _db.Testimonials.Add(testimonial);
            await _db.SaveChangesAsync();
            return testimonial;
        }

        public async Task UpdateAsync(Testimonial testimonial)
        {
            _db.Testimonials.Update(testimonial);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var testimonial = await _db.Testimonials.FindAsync(id);
            if (testimonial != null)
            {
                _db.Testimonials.Remove(testimonial);
                await _db.SaveChangesAsync();
            }
        }
    }
}
