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
    public class AddressRepository : IAddressRepository
    {
        private readonly AppDbContext _db;

        public AddressRepository(AppDbContext db) => _db = db;

        public async Task<IEnumerable<Address>> GetByUserIdAsync(Guid userId)
        {
            return await _db.Addresses
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.IsDefault)
                .ThenBy(a => a.FullName)
                .ToListAsync();
        }

        public async Task<Address?> GetByIdAsync(Guid id)
        {
            return await _db.Addresses
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<Address?> GetDefaultByUserIdAsync(Guid userId)
        {
            return await _db.Addresses
                .FirstOrDefaultAsync(a => a.UserId == userId && a.IsDefault);
        }

        public async Task<Address> CreateAsync(Address address)
        {
            if (!await _db.Addresses.AnyAsync(a => a.UserId == address.UserId))
                address.IsDefault = true;

            // If this is set as default, remove default from other addresses
            if (address.IsDefault)
            {
                var otherDefaults = await _db.Addresses
                    .Where(a => a.UserId == address.UserId && a.IsDefault)
                    .ToListAsync();
                foreach (var a in otherDefaults)
                    a.IsDefault = false;

                await _db.SaveChangesAsync();
            }

            _db.Addresses.Add(address);
            await _db.SaveChangesAsync();
            return address;
        }

        public async Task UpdateAsync(Address address)
        {
            // If this is set as default, remove default from other addresses
            if (address.IsDefault)
            {
                var otherDefaults = await _db.Addresses
                    .Where(a => a.UserId == address.UserId && a.Id != address.Id && a.IsDefault)
                    .ToListAsync();
                foreach (var a in otherDefaults)
                    a.IsDefault = false;

                address.IsDefault = false;
                await _db.SaveChangesAsync();
                address.IsDefault = true;
            }

            _db.Addresses.Update(address);
            await _db.SaveChangesAsync();
        }

        public async Task SetDefaultAsync(Address address)
        {
            var addresses = await _db.Addresses
                .Where(a => a.UserId == address.UserId)
                .ToListAsync();

            foreach (var item in addresses)
                item.IsDefault = false;

            await _db.SaveChangesAsync();

            address.IsDefault = true;

            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var address = await _db.Addresses.FindAsync(id);
            if (address != null)
            {
                _db.Addresses.Remove(address);
                await _db.SaveChangesAsync();
            }
        }
    }
}
