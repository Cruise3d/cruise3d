using cruise3d.API.Models.DTOs.Auth;

namespace cruise3d.API.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> GetProfileAsync(Guid userId);
}
