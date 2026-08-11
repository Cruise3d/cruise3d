using System;
using System.Threading.Tasks;
using cruise3d.API.Models.DTOs.Common;
using cruise3d.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace cruise3d.API.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categories;

    public CategoriesController(ICategoryService categories)
        => _categories = categories;

    // GET api/categories
    // Public — homepage category section and product filter
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _categories.GetAllAsync();
        return Ok(ApiResponse<object>.Ok(result));
    }

    // GET api/categories/{id}
    // Public
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _categories.GetByIdAsync(id);
        return Ok(ApiResponse<object>.Ok(result));
    }

    // POST api/categories
    // Admin only
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
    {
        var result = await _categories.CreateAsync(dto.Name, dto.Slug, dto.IconUrl);
        return Ok(ApiResponse<object>.Ok(result, "Category created successfully."));
    }

    // PUT api/categories/{id}
    // Admin only
    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateCategoryDto dto)
    {
        var result = await _categories.UpdateAsync(id, dto.Name, dto.Slug, dto.IconUrl);
        return Ok(ApiResponse<object>.Ok(result, "Category updated successfully."));
    }

    // DELETE api/categories/{id}
    // Admin only
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _categories.DeleteAsync(id);
        return Ok(ApiResponse<string>.Ok("Category deleted.", "Deleted successfully."));
    }
}

// DTO defined here since it's simple and only used by this controller
public class CreateCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? IconUrl { get; set; }
}
