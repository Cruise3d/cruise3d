using System;
using System.Threading.Tasks;
using cruise3d.API.Models.DTOs.Payment;

namespace cruise3d.API.Services.Interfaces;

public interface IPaymentService
{
    Task<CreateRazorpayOrderResponseDto> CreateRazorpayOrderAsync(Guid userId);
    Task<VerifyPaymentResponseDto> VerifyPaymentAsync(VerifyPaymentRequestDto dto, Guid userId);
    Task<bool> TestRazorpayConnectionAsync();
}
