using System.ComponentModel.DataAnnotations;

namespace cruise3d.API.Models.DTOs.Auth;

public class ResetPasswordRequestDto
{
    [Required]
    public string Token { get; set; } = string.Empty;

    [Required]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters.")]
    [MaxLength(100)]
    public string NewPassword { get; set; } = string.Empty;
}
