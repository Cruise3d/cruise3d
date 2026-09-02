namespace cruise3d.API.Models.DTOs.Auth;

public class RegisterResponseDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsEmailVerified { get; set; }
}
