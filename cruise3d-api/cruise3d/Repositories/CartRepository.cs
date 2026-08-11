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
    public class CartRepository : ICartRepository
    {
        private readonly AppDbContext _db;

        public CartRepository(AppDbContext db) => _db = db;

        public async Task<IEnumerable<Cart>> GetByUserIdAsync(Guid userId)
        {
            return await _db.Carts
                .Include(c => c.Product)
                    .ThenInclude(p => p!.Images.Where(i => i.IsPrimary))
                .Include(c => c.ProductColor)
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.AddedAt)
                .ToListAsync();
        }

        public async Task<Cart?> GetByIdAsync(Guid id)
        {
            return await _db.Carts
                .Include(c => c.Product)
                .Include(c => c.ProductColor)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Cart?> GetByUserAndProductAsync(Guid userId, Guid productId, Guid? productColorId)
        {
            var query = _db.Carts
                .Where(c => c.UserId == userId && c.ProductId == productId);

            if (productColorId.HasValue)
                query = query.Where(c => c.ProductColorId == productColorId);
            else
                query = query.Where(c => c.ProductColorId == null);

            return await query.FirstOrDefaultAsync();
        }

        public async Task<Cart> CreateAsync(Cart cart)
        {
            _db.Carts.Add(cart);
            await _db.SaveChangesAsync();
            return cart;
        }

        public async Task UpdateAsync(Cart cart)
        {
            _db.Carts.Update(cart);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var cart = await _db.Carts.FindAsync(id);
            if (cart != null)
            {
                _db.Carts.Remove(cart);
                await _db.SaveChangesAsync();
            }
        }

        public async Task DeleteByUserIdAsync(Guid userId)
        {
            var carts = await _db.Carts.Where(c => c.UserId == userId).ToListAsync();
            _db.Carts.RemoveRange(carts);
            await _db.SaveChangesAsync();
        }
    }
}
