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
    public class CategoryRepository : ICategoryRepository
    {
        private readonly AppDbContext _db;

        public CategoryRepository(AppDbContext db) => _db = db;

        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            return await _db.Categories
                .OrderBy(c => c.SortOrder)
                .ThenBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<Category?> GetByIdAsync(Guid id)
        {
            return await _db.Categories
                .Include(c => c.Products)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Category?> GetBySlugAsync(string slug)
        {
            return await _db.Categories
                .Include(c => c.Products)
                .FirstOrDefaultAsync(c => c.Slug == slug);
        }

        public async Task<Category> CreateAsync(Category category)
        {
            _db.Categories.Add(category);
            await _db.SaveChangesAsync();
            return category;
        }

        public async Task UpdateAsync(Category category)
        {
            _db.Categories.Update(category);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var category = await _db.Categories.FindAsync(id);
            if (category != null)
            {
                _db.Categories.Remove(category);
                await _db.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _db.Categories.AnyAsync(c => c.Id == id);
        }

        public async Task<bool> SlugExistsAsync(string slug, Guid? excludeId = null)
        {
            var query = _db.Categories.Where(c => c.Slug == slug);
            if (excludeId.HasValue)
                query = query.Where(c => c.Id != excludeId.Value);
            return await query.AnyAsync();
        }
    }
}
