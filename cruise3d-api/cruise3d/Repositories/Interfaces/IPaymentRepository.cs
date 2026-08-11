using cruise3d.Models.Entities;

namespace cruise3d.API.Repositories.Interfaces
{
    public interface IPaymentRepository
    {
        Task<Payment?> GetByRazorpayOrderIdAsync(string razorpayOrderId);
        Task<Payment?> GetByRazorpayPaymentIdAsync(string razorpayPaymentId);
        Task<Payment?> GetByOrderIdAsync(Guid orderId);
        Task<Payment> CreateAsync(Payment payment);
        Task UpdateAsync(Payment payment);
    }
}
