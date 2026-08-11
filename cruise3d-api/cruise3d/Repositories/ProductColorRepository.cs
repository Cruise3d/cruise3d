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
    public class ProductColorRepository : IProductColorRepository
    {
        private readonly AppDbContext _db;

        public ProductColorRepository(AppDbContext db) => _db = db;

        public async Task<IEnumerable<ProductColor>> GetByProductIdAsync(Guid productId)
        {
            return await _db.ProductColors
                .Include(c => c.Images)
                .Where(c => c.ProductId == productId)
                .OrderBy(c => c.SortOrder)
                .ToListAsync();
        }

        public async Task<ProductColor?> GetByIdAsync(Guid id)
        {
            return await _db.ProductColors
                .Include(c => c.Images)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<ProductColor> CreateAsync(ProductColor color)
        {
            _db.ProductColors.Add(color);
            await _db.SaveChangesAsync();
            return color;
        }

        public async Task UpdateAsync(ProductColor color)
        {
            _db.ProductColors.Update(color);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var color = await _db.ProductColors.FindAsync(id);
            if (color != null)
            {
                _db.ProductColors.Remove(color);
                await _db.SaveChangesAsync();
            }
        }
    }
}
