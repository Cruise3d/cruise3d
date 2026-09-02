using System.ComponentModel.DataAnnotations;

namespace cruise3d.API.Models.DTOs.Auth;

public class VerifyEmailRequestDto
{
    [Required]
    public string Token { get; set; } = string.Empty;
}
