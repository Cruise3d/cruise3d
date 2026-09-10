using cruise3d.API.Models.DTOs.Auth;

namespace cruise3d.API.Services.Interfaces;

public interface IAuthService
{
    Task<RegisterResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> GetProfileAsync(Guid userId);
    Task<AuthResponseDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto);
    Task VerifyEmailAsync(string token);
    Task ResendVerificationEmailAsync(string email);
    Task ForgotPasswordAsync(string email);
    Task ResetPasswordAsync(ResetPasswordRequestDto dto);
}

