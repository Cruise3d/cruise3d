using System.ComponentModel.DataAnnotations;

namespace cruise3d.API.Models.DTOs.Auth;

public class ResendVerificationEmailRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}
