using System;
using System.Threading.Tasks;
using cruise3d.Models.Entities;
using cruise3d.API.Repositories.Interfaces;
using cruise3d.API.Data;
using Microsoft.EntityFrameworkCore;

namespace cruise3d.API.Repositories
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly AppDbContext _db;

        public PaymentRepository(AppDbContext db) => _db = db;

        public async Task<Payment?> GetByRazorpayOrderIdAsync(string razorpayOrderId)
        {
            return await _db.Payments
                .FirstOrDefaultAsync(p => p.RazorpayOrderId == razorpayOrderId);
        }

        public async Task<Payment?> GetByRazorpayPaymentIdAsync(string razorpayPaymentId)
        {
            return await _db.Payments
                .FirstOrDefaultAsync(p => p.RazorpayPaymentId == razorpayPaymentId);
        }

        public async Task<Payment?> GetByOrderIdAsync(Guid orderId)
        {
            return await _db.Payments
                .FirstOrDefaultAsync(p => p.OrderId == orderId);
        }

        public async Task<Payment> CreateAsync(Payment payment)
        {
            _db.Payments.Add(payment);
            await _db.SaveChangesAsync();
            return payment;
        }

        public async Task UpdateAsync(Payment payment)
        {
            _db.Payments.Update(payment);
            await _db.SaveChangesAsync();
        }
    }
}
