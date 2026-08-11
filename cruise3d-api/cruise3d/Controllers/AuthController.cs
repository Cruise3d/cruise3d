using cruise3d.API.Helpers;
using cruise3d.API.Models.DTOs.Auth;
using cruise3d.API.Models.DTOs.Common;
using cruise3d.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace cruise3d.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth)
        => _auth = auth;

    // POST api/auth/register
    // Public — anyone can register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await _auth.RegisterAsync(dto);
        return Ok(ApiResponse<AuthResponseDto>.Ok(result, "Registration successful."));
    }

    // POST api/auth/login
    // Public — admin and customer both use this same endpoint
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _auth.LoginAsync(dto);
        return Ok(ApiResponse<AuthResponseDto>.Ok(result, "Login successful."));
    }

    // GET api/auth/me
    // Returns the logged-in user's profile
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = JwtHelper.GetUserId(User);
        var result = await _auth.GetProfileAsync(userId);
        return Ok(ApiResponse<AuthResponseDto>.Ok(result));
    }
}

