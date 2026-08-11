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
    public class ProductRepository : IProductRepository
    {
        private readonly AppDbContext _db;

        public ProductRepository(AppDbContext db) => _db = db;

        public async Task<(IEnumerable<Product> Items, int Total)> GetAllAsync(
            Guid? categoryId, string? search, decimal? minPrice, decimal? maxPrice,
            string? sortBy, int page, int pageSize)
        {
            var query = _db.Products
                .Include(p => p.Images.Where(i => i.IsPrimary))
                .Include(p => p.Category)
                .Include(p => p.Reviews)
                .AsQueryable();

            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryId == categoryId);

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(p =>
                    p.Title.ToLower().Contains(search.ToLower()) ||
                    p.Description!.ToLower().Contains(search.ToLower()));

            if (minPrice.HasValue)
                query = query.Where(p => p.Price >= minPrice);

            if (maxPrice.HasValue)
                query = query.Where(p => p.Price <= maxPrice);

            query = sortBy switch
            {
                "price_asc" => query.OrderBy(p => p.Price),
                "price_desc" => query.OrderByDescending(p => p.Price),
                "newest" => query.OrderByDescending(p => p.CreatedAt),
                "rating" => query.OrderByDescending(p =>
                    p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0),
                _ => query.OrderByDescending(p => p.CreatedAt)
            };

            var total = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, total);
        }

        public async Task<Product?> GetByIdAsync(Guid id)
        {
            return await _db.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Product?> GetByIdWithDetailsAsync(Guid id)
        {
            return await _db.Products
                .Include(p => p.Images)
                .Include(p => p.Colors)
                .Include(p => p.Specs)
                .Include(p => p.Category)
                .Include(p => p.Reviews)
                .ThenInclude(r => r.Customer)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Product>> GetFeaturedAsync()
        {
            return await _db.Products
                .Include(p => p.Images.Where(i => i.IsPrimary))
                .Include(p => p.Category)
                .Where(p => p.IsFeatured && p.IsActive)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetBestsellersAsync()
        {
            return await _db.Products
                .Include(p => p.Images.Where(i => i.IsPrimary))
                .Include(p => p.Category)
                .Where(p => p.IsBestseller && p.IsActive)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetByCategoryIdAsync(Guid categoryId)
        {
            return await _db.Products
                .Include(p => p.Images.Where(i => i.IsPrimary))
                .Include(p => p.Category)
                .Where(p => p.CategoryId == categoryId && p.IsActive)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<Product> CreateAsync(Product product)
        {
            _db.Products.Add(product);
            await _db.SaveChangesAsync();
            return product;
        }

        public async Task UpdateAsync(Product product)
        {
            _db.Products.Update(product);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var product = await _db.Products.FindAsync(id);
            if (product != null)
            {
                _db.Products.Remove(product);
                await _db.SaveChangesAsync();
            }
        }

        public async Task<bool> SkuExistsAsync(string sku, Guid? excludeId = null)
        {
            var query = _db.Products.Where(p => p.Sku == sku);
            if (excludeId.HasValue)
                query = query.Where(p => p.Id != excludeId.Value);
            return await query.AnyAsync();
        }
    }
}
