using cruise3d.Models.Entities;

namespace cruise3d.API.Repositories.Interfaces
{
    public interface IOrderRepository
    {
        Task<(IEnumerable<Order> Items, int Total)> GetAllAsync(
            Guid? customerId, string? status, int page, int pageSize);
        Task<Order?> GetByIdAsync(Guid id);
        Task<Order?> GetByIdWithItemsAsync(Guid id);
        Task<IEnumerable<Order>> GetByCustomerIdAsync(Guid customerId);
        Task<Order> CreateAsync(Order order);
        Task UpdateAsync(Order order);
        Task DeleteAsync(Guid id);
    }
}
