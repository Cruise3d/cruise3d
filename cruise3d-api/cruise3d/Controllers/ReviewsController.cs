using cruise3d.API.Helpers;
using cruise3d.API.Models.DTOs.Common;
using cruise3d.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace cruise3d.API.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviews;

    public ReviewsController(IReviewService reviews)
        => _reviews = reviews;

    // GET api/reviews/product/{productId}
    // Public — anyone can read reviews
    [HttpGet("product/{productId}")]
    public async Task<IActionResult> GetByProduct(Guid productId)
    {
        var result = await _reviews.GetByProductAsync(productId);
        return Ok(ApiResponse<object>.Ok(result));
    }

    // POST api/reviews
    // Customer only — write a review
    [HttpPost]
    [Authorize(Roles = "customer")]
    public async Task<IActionResult> Create([FromBody] CreateReviewDto dto)
    {
        var customerId = JwtHelper.GetUserId(User);
        var result = await _reviews.CreateAsync(
            customerId, dto.ProductId, dto.OrderId, dto.Rating, dto.Comment);
        return Ok(ApiResponse<object>.Ok(result, "Review submitted successfully."));
    }

    // DELETE api/reviews/{reviewId}
    // Customer can delete their own review
    [HttpDelete("{reviewId}")]
    [Authorize(Roles = "customer")]
    public async Task<IActionResult> Delete(Guid reviewId)
    {
        var customerId = JwtHelper.GetUserId(User);
        await _reviews.DeleteAsync(reviewId, customerId);
        return Ok(ApiResponse<string>.Ok("Review deleted."));
    }
}

public class CreateReviewDto
{
    public Guid    ProductId { get; set; }
    public Guid    OrderId   { get; set; }
    public int     Rating    { get; set; }
    public string? Comment   { get; set; }
}

