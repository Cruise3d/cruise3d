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
    public class ReviewRepository : IReviewRepository
    {
        private readonly AppDbContext _db;

        public ReviewRepository(AppDbContext db) => _db = db;

        public async Task<(IEnumerable<Review> Items, int Total)> GetAllAsync(
            Guid? productId, int page, int pageSize)
        {
            var query = _db.Reviews
                .Include(r => r.Customer)
                .Include(r => r.Product)
                .AsQueryable();

            if (productId.HasValue)
                query = query.Where(r => r.ProductId == productId.Value);

            query = query.OrderByDescending(r => r.CreatedAt);

            var total = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, total);
        }

        public async Task<Review?> GetByIdAsync(Guid id)
        {
            return await _db.Reviews
                .Include(r => r.Customer)
                .Include(r => r.Product)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<Review>> GetByProductIdAsync(Guid productId)
        {
            return await _db.Reviews
                .Include(r => r.Customer)
                .Where(r => r.ProductId == productId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Review>> GetByCustomerIdAsync(Guid customerId)
        {
            return await _db.Reviews
                .Include(r => r.Product)
                .Where(r => r.CustomerId == customerId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<Review> CreateAsync(Review review)
        {
            _db.Reviews.Add(review);
            await _db.SaveChangesAsync();
            return review;
        }

        public async Task UpdateAsync(Review review)
        {
            _db.Reviews.Update(review);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var review = await _db.Reviews.FindAsync(id);
            if (review != null)
            {
                _db.Reviews.Remove(review);
                await _db.SaveChangesAsync();
            }
        }

        public async Task<double> GetAverageRatingByProductIdAsync(Guid productId)
        {
            return await _db.Reviews
                .Where(r => r.ProductId == productId)
                .Select(r => (double?)r.Rating)
                .AverageAsync() ?? 0;
        }

        public async Task<int> GetCountByProductIdAsync(Guid productId)
        {
            return await _db.Reviews
                .CountAsync(r => r.ProductId == productId);
        }
    }
}
