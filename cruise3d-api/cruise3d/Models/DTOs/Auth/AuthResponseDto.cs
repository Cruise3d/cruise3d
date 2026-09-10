using Org.BouncyCastle.Bcpg.OpenPgp;

namespace cruise3d.API.Models.DTOs.Auth;

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;
    public bool IsEmailVerified { get; set; }
}

