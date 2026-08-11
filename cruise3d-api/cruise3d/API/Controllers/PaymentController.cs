using System;
using System.Threading.Tasks;
using cruise3d.API.Models.DTOs.Common;
using cruise3d.API.Models.DTOs.Payment;
using cruise3d.API.Services.Interfaces;
using cruise3d.API.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace cruise3d.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _payments;

    public PaymentsController(IPaymentService payments)
    {
        _payments = payments;
    }

    [HttpGet("test-connection")]
    public async Task<IActionResult> TestConnection()
    {
        var ok = await _payments.TestRazorpayConnectionAsync();
        if (ok) return Ok(ApiResponse<object>.Ok(null, "Razorpay connection successful."));
        return StatusCode(500, ApiResponse<object>.Fail("Razorpay connection failed. Check keys in configuration."));
    }

    [HttpPost("create-order")]
    [Authorize(Roles = "customer")]
    public async Task<IActionResult> CreateOrder()
    {
        var userId = JwtHelper.GetUserId(User);
        var result = await _payments.CreateRazorpayOrderAsync(userId);
        return Ok(ApiResponse<CreateRazorpayOrderResponseDto>.Ok(result));
    }

    [HttpPost("verify")]
    [Authorize(Roles = "customer")]
    public async Task<IActionResult> Verify([FromBody] VerifyPaymentRequestDto dto)
    {
        var userId = JwtHelper.GetUserId(User);
        var result = await _payments.VerifyPaymentAsync(dto, userId);
        return Ok(ApiResponse<VerifyPaymentResponseDto>.Ok(result, "Payment verified and order created."));
    }
}
