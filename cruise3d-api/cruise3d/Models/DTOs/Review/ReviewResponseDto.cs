using System;

namespace cruise3d.API.Models.DTOs.Review;

public class ReviewResponseDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid OrderId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CustomerName { get; set; }
}
