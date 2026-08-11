using cruise3d.API.Data;
using cruise3d.API.Models.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace cruise3d.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminController(AppDbContext db)
        => _db = db;

    // GET api/admin/dashboard
    // Returns stats for the admin dashboard
    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var totalProducts  = await _db.Products.CountAsync();
        var totalOrders    = await _db.Orders.CountAsync();
        var totalCustomers = await _db.Users
                                .CountAsync(u => u.Role == "customer");
        var totalRevenue   = await _db.Orders
                                .Where(o => o.PaymentStatus == "paid")
                                .SumAsync(o => o.TotalAmount);
        var pendingOrders  = await _db.Orders
                                .CountAsync(o => o.Status == "pending");
        var lowStockProducts = await _db.Products
                                .Where(p => p.Stock <= 5)
                                .Select(p => new
                                {
                                    p.Id,
                                    p.Title,
                                    p.Stock,
                                    p.Sku
                                })
                                .ToListAsync();

        var result = new
        {
            TotalProducts    = totalProducts,
            TotalOrders      = totalOrders,
            TotalCustomers   = totalCustomers,
            TotalRevenue     = totalRevenue,
            PendingOrders    = pendingOrders,
            LowStockProducts = lowStockProducts
        };

        return Ok(ApiResponse<object>.Ok(result));
    }
}
