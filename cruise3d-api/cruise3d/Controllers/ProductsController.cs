using cruise3d.API.Models.DTOs.Common;
using cruise3d.API.Models.DTOs.Product;
using cruise3d.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace cruise3d.API.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _products;

    public ProductsController(IProductService products)
        => _products = products;

    // GET api/products
    // Public — customer browse page with search, filter, pagination
    // Example: GET api/products?search=dragon&categoryId=xxx&minPrice=100&maxPrice=500&sortBy=price_asc&page=1&pageSize=12
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid?    categoryId,
        [FromQuery] string?  search,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string   sortBy   = "newest",
        [FromQuery] int      page     = 1,
        [FromQuery] int      pageSize = 12)
    {
        var (items, total) = await _products.GetAllAsync(
            categoryId, search, minPrice, maxPrice, sortBy, page, pageSize);

        // Return pagination metadata alongside data
        var result = new
        {
            Items      = items,
            Total      = total,
            Page       = page,
            PageSize   = pageSize,
            TotalPages = (int)Math.Ceiling((double)total / pageSize)
        };

        return Ok(ApiResponse<object>.Ok(result));
    }

    // GET api/products/featured
    // Public — homepage featured section
    [HttpGet("featured")]
    public async Task<IActionResult> GetFeatured()
    {
        var result = await _products.GetFeaturedAsync();
        return Ok(ApiResponse<object>.Ok(result));
    }

    // GET api/products/bestsellers
    // Public — homepage bestsellers section
    [HttpGet("bestsellers")]
    public async Task<IActionResult> GetBestsellers()
    {
        var result = await _products.GetBestsellersAsync();
        return Ok(ApiResponse<object>.Ok(result));
    }

    // GET api/products/{id}
    // Public — product detail page
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _products.GetByIdAsync(id);
        return Ok(ApiResponse<ProductResponseDto>.Ok(result));
    }

    // POST api/products
    // Admin only — create new product
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] ProductCreateDto dto)
    {
        var result = await _products.CreateAsync(dto);
        return CreatedAtAction(
            nameof(GetById),
            new { id = result.Id },
            ApiResponse<ProductResponseDto>.Ok(result, "Product created successfully.")
        );
    }

    // PUT api/products/{id}
    // Admin only — update product
    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ProductUpdateDto dto)
    {
        var result = await _products.UpdateAsync(id, dto);
        return Ok(ApiResponse<ProductResponseDto>.Ok(result, "Product updated successfully."));
    }

    // DELETE api/products/{id}
    // Admin only — soft delete product
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _products.DeleteAsync(id);
        return Ok(ApiResponse<string>.Ok("Product deleted.", "Product deleted successfully."));
    }
}

