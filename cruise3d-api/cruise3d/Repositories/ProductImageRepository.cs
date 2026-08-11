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
    public class ProductImageRepository : IProductImageRepository
    {
        private readonly AppDbContext _db;

        public ProductImageRepository(AppDbContext db) => _db = db;

        public async Task<IEnumerable<ProductImage>> GetByProductIdAsync(Guid productId)
        {
            return await _db.ProductImages
                .Where(i => i.ProductId == productId)
                .OrderBy(i => i.SortOrder)
                .ToListAsync();
        }

        public async Task<IEnumerable<ProductImage>> GetByProductColorIdAsync(Guid productColorId)
        {
            return await _db.ProductImages
                .Where(i => i.ProductColorId == productColorId)
                .OrderBy(i => i.SortOrder)
                .ToListAsync();
        }

        public async Task<ProductImage?> GetByIdAsync(Guid id)
        {
            return await _db.ProductImages.FindAsync(id);
        }

        public async Task<ProductImage> CreateAsync(ProductImage image)
        {
            _db.ProductImages.Add(image);
            await _db.SaveChangesAsync();
            return image;
        }

        public async Task UpdateAsync(ProductImage image)
        {
            _db.ProductImages.Update(image);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var image = await _db.ProductImages.FindAsync(id);
            if (image != null)
            {
                _db.ProductImages.Remove(image);
                await _db.SaveChangesAsync();
            }
        }

        public async Task DeleteByProductIdAsync(Guid productId)
        {
            var images = await _db.ProductImages
                .Where(i => i.ProductId == productId)
                .ToListAsync();
            _db.ProductImages.RemoveRange(images);
            await _db.SaveChangesAsync();
        }
    }
}
