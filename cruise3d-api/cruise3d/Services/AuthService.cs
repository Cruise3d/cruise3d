using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using cruise3d.API.Models.DTOs.Auth;
using cruise3d.Models.Entities;
using cruise3d.API.Repositories.Interfaces;
using cruise3d.API.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;

namespace cruise3d.API.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IConfiguration _config;

    public AuthService(IUserRepository users, IConfiguration config)
    {
        _users = users;
        _config = config;
    }

    // ─── REGISTER ────────────────────────────────────────────────────────────
    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        // 1. Check email not already taken
        if (await _users.EmailExistsAsync(dto.Email))
            throw new Exception("Email is already registered.");

        // 2. Create user with hashed password
        var user = new User
        {
            Id           = Guid.NewGuid(),
            Name         = dto.Name,
            Email        = dto.Email.ToLower().Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Phone        = dto.Phone,
            Role         = "customer",   // public registration always customer
            IsActive     = true,
            CreatedAt    = DateTime.UtcNow,
            UpdatedAt    = DateTime.UtcNow
        };

        await _users.CreateAsync(user);

        // 3. Return token immediately — no need to login separately
        return BuildAuthResponse(user);
    }

    // ─── LOGIN ───────────────────────────────────────────────────────────────
    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        // 1. Find user by email
        var user = await _users.GetByEmailAsync(dto.Email.ToLower().Trim())
            ?? throw new Exception("Invalid email or password.");

        // 2. Check account is active
        if (!user.IsActive)
            throw new Exception("Your account has been disabled. Contact support.");

        // 3. Verify password against stored hash
        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new Exception("Invalid email or password.");

        // 4. Return JWT token
        return BuildAuthResponse(user);
    }

    // ─── GET PROFILE ─────────────────────────────────────────────────────────
    public async Task<AuthResponseDto> GetProfileAsync(Guid userId)
    {
        var user = await _users.GetByIdAsync(userId)
            ?? throw new Exception("User not found.");

        return BuildAuthResponse(user);
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    // Builds the JWT token and returns the response DTO
    private AuthResponseDto BuildAuthResponse(User user)
    {
        var token = GenerateJwt(user);
        return new AuthResponseDto
        {
            Token = token,
            Name  = user.Name,
            Email = user.Email,
            Role  = user.Role
        };
    }

    // Generates a signed JWT token containing user claims
    private string GenerateJwt(User user)
    {
        // Claims = information baked into the token
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email,          user.Email),
            new Claim(ClaimTypes.Name,           user.Name),
            new Claim(ClaimTypes.Role,           user.Role)
        };

        var jwtKey = _config["Jwt:Key"];
        if (string.IsNullOrWhiteSpace(jwtKey))
            throw new InvalidOperationException("JWT Key is not configured. Set 'Jwt:Key' in configuration.");

        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Read expiry minutes with a safe default when configuration is missing or invalid
        var expiryMinutes = _config.GetValue<int?>("Jwt:ExpiryMinutes") ?? 60; // default 60 minutes
        var expiry = DateTime.UtcNow.AddMinutes(expiryMinutes);

        var token = new JwtSecurityToken(
            issuer:             _config["Jwt:Issuer"],
            audience:           _config["Jwt:Audience"],
            claims:             claims,
            expires:            expiry,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

