using System;
using System.ComponentModel.DataAnnotations;

namespace cruise3d.API.Models.DTOs.Offer;

public class OfferCreateDto
{
    [Required(ErrorMessage = "Message is required and cannot be empty.")]
    [MaxLength(1000)]
    public string Message { get; set; } = string.Empty;

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    public bool IsActive { get; set; } = true;
}
