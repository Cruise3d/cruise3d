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
    public class OrderRepository : IOrderRepository
    {
        private readonly AppDbContext _db;

        public OrderRepository(AppDbContext db) => _db = db;

        public async Task<(IEnumerable<Order> Items, int Total)> GetAllAsync(
            Guid? customerId, string? status, int page, int pageSize)
        {
            var query = _db.Orders
                .Include(o => o.Customer)
                .Include(o => o.Address)
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                .AsQueryable();

            if (customerId.HasValue)
                query = query.Where(o => o.CustomerId == customerId.Value);

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(o => o.Status == status);

            query = query.OrderByDescending(o => o.PlacedAt);

            var total = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, total);
        }

        public async Task<Order?> GetByIdAsync(Guid id)
        {
            return await _db.Orders
                .Include(o => o.Customer)
                .Include(o => o.Address)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<Order?> GetByIdWithItemsAsync(Guid id)
        {
            return await _db.Orders
                .Include(o => o.Customer)
                .Include(o => o.Address)
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                .Include(o => o.Items)
                    .ThenInclude(i => i.ProductColor)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<IEnumerable<Order>> GetByCustomerIdAsync(Guid customerId)
        {
            return await _db.Orders
                .Include(o => o.Address)
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                .Where(o => o.CustomerId == customerId)
                .OrderByDescending(o => o.PlacedAt)
                .ToListAsync();
        }

        public async Task<Order> CreateAsync(Order order)
        {
            _db.Orders.Add(order);
            await _db.SaveChangesAsync();
            return order;
        }

        public async Task UpdateAsync(Order order)
        {
            _db.Orders.Update(order);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var order = await _db.Orders.FindAsync(id);
            if (order != null)
            {
                _db.Orders.Remove(order);
                await _db.SaveChangesAsync();
            }
        }
    }
}
