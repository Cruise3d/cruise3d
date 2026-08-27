using System;
using System.ComponentModel.DataAnnotations;

namespace cruise3d.API.Models.DTOs.Offer;

public class OfferUpdateDto
{
    [MaxLength(1000)]
    public string? Message { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public bool? IsActive { get; set; }
}
