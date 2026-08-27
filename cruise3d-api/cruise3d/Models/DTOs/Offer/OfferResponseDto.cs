using System;

namespace cruise3d.API.Models.DTOs.Offer;

public class OfferResponseDto
{
    public Guid Id { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
