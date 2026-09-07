using System;
using System.Security.Cryptography;
using System.Text;
using cruise3d.API.Repositories.Interfaces;
using cruise3d.API.Services.Interfaces;
using cruise3d.Models.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.WebUtilities;
using cruise3d.Models.Settings;

namespace cruise3d.API.Services
{
    public class PasswordResetTokenService : IPasswordResetTokenService
    {
        private readonly IPasswordResetTokenRepository _tokens;
        private readonly PasswordResetOptions _options;
        private readonly IConfiguration _config;

        public PasswordResetTokenService(
            IPasswordResetTokenRepository tokens,
            IOptions<PasswordResetOptions> options,
            IConfiguration config)
        {
            _tokens = tokens;
            _options = options.Value;
            _config = config;
        }

        public async Task<(string RawToken, DateTime ExpiresAt, string ResetLink)> IssueAsync(
            Guid userId,
            CancellationToken cancellationToken = default)
        {
            await RevokeActiveAsync(userId, cancellationToken);

            var rawToken = GenerateRawToken();
            var tokenHash = HashToken(rawToken);
            var now = DateTime.UtcNow;
            var expiresAt = now.AddMinutes(_options.TokenLifetimeMinutes);

            await _tokens.CreateAsync(new PasswordResetToken
            {
                UserId = userId,
                TokenHash = tokenHash,
                CreatedAt = now,
                ExpiresAt = expiresAt
            });

            return (rawToken, expiresAt, BuildResetLink(rawToken));
        }

        public async Task<Guid?> ValidateAndConsumeAsync(string rawToken, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(rawToken))
                return null;

            var tokenHash = HashToken(rawToken);
            var now = DateTime.UtcNow;
            return await _tokens.ValidateAndConsumeAsync(tokenHash, now, cancellationToken);
        }

        public async Task RevokeActiveAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var now = DateTime.UtcNow;
            await _tokens.RevokeActiveByUserIdAsync(userId, now);
        }

        private string BuildResetLink(string rawToken)
        {
            var publicUrl = _config["App:PublicUrl"]
                ?? _config["Frontend:PublicUrl"]
                ?? _config["Frontend:BaseUrl"];

            if (!Uri.TryCreate(publicUrl, UriKind.Absolute, out var baseUri))
                throw new InvalidOperationException("Frontend public URL is not configured.");

            var relativePath = _options.ResetPasswordPath.TrimStart('/');
            var relativeUri = $"{relativePath}?token={Uri.EscapeDataString(rawToken)}";
            return new Uri(baseUri, relativeUri).ToString();
        }

        private static string GenerateRawToken()
        {
            var bytes = RandomNumberGenerator.GetBytes(32);
            return WebEncoders.Base64UrlEncode(bytes);
        }

        private static string HashToken(string rawToken)
        {
            var hash = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
            return Convert.ToHexString(hash).ToLowerInvariant();
        }
    }
}
