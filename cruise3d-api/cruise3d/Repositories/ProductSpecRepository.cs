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
    public class ProductSpecRepository : IProductSpecRepository
    {
        private readonly AppDbContext _db;

        public ProductSpecRepository(AppDbContext db) => _db = db;

        public async Task<IEnumerable<ProductSpec>> GetByProductIdAsync(Guid productId)
        {
            return await _db.ProductSpecs
                .Where(s => s.ProductId == productId)
                .OrderBy(s => s.SortOrder)
                .ToListAsync();
        }

        public async Task<ProductSpec?> GetByIdAsync(Guid id)
        {
            return await _db.ProductSpecs.FindAsync(id);
        }

        public async Task<ProductSpec> CreateAsync(ProductSpec spec)
        {
            _db.ProductSpecs.Add(spec);
            await _db.SaveChangesAsync();
            return spec;
        }

        public async Task UpdateAsync(ProductSpec spec)
        {
            _db.ProductSpecs.Update(spec);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var spec = await _db.ProductSpecs.FindAsync(id);
            if (spec != null)
            {
                _db.ProductSpecs.Remove(spec);
                await _db.SaveChangesAsync();
            }
        }

        public async Task DeleteByProductIdAsync(Guid productId)
        {
            var specs = await _db.ProductSpecs
                .Where(s => s.ProductId == productId)
                .ToListAsync();
            _db.ProductSpecs.RemoveRange(specs);
            await _db.SaveChangesAsync();
        }
    }
}
