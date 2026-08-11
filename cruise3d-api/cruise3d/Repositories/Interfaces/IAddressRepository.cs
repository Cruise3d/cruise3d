using cruise3d.Models.Entities;

namespace cruise3d.API.Repositories.Interfaces
{
    public interface IAddressRepository
    {
        Task<IEnumerable<Address>> GetByUserIdAsync(Guid userId);
        Task<Address?> GetByIdAsync(Guid id);
        Task<Address?> GetDefaultByUserIdAsync(Guid userId);
        Task<Address> CreateAsync(Address address);
        Task UpdateAsync(Address address);
        Task DeleteAsync(Guid id);
    }
}
