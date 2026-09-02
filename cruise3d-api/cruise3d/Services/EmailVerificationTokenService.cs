using System;
using System.Security.Cryptography;
using System.Text;
using cruise3d.API.Models.Settings;
using cruise3d.API.Repositories.Interfaces;
using cruise3d.API.Services.Interfaces;
using cruise3d.Models.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.WebUtilities;

namespace cruise3d.API.Services
{
    public class EmailVerificationTokenService : IEmailVerificationTokenService
    {
        private readonly IEmailVerificationTokenRepository _tokens;
        private readonly EmailVerificationOptions _options;
        private readonly IConfiguration _config;

        public EmailVerificationTokenService(
            IEmailVerificationTokenRepository tokens,
            IOptions<EmailVerificationOptions> options,
            IConfiguration config)
        {
            _tokens = tokens;
            _options = options.Value;
            _config = config;
        }

        public async Task<(string RawToken, DateTime ExpiresAt, string VerificationLink)> IssueAsync(
            Guid userId,
            CancellationToken cancellationToken = default)
        {
            await RevokeActiveAsync(userId, cancellationToken);

            var rawToken = GenerateRawToken();
            var tokenHash = HashToken(rawToken);
            var now = DateTime.UtcNow;
            var expiresAt = now.AddMinutes(_options.TokenLifetimeMinutes);

            await _tokens.CreateAsync(new EmailVerificationToken
            {
                UserId = userId,
                TokenHash = tokenHash,
                CreatedAt = now,
                ExpiresAt = expiresAt
            });

            return (rawToken, expiresAt, BuildVerificationLink(rawToken));
        }

        public async Task<bool> ConsumeAsync(string rawToken, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(rawToken))
                return false;

            var tokenHash = HashToken(rawToken);
            return await _tokens.ConsumeAsync(tokenHash, DateTime.UtcNow, DateTime.UtcNow);
        }

        public async Task RevokeActiveAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            await _tokens.RevokeActiveByUserIdAsync(userId, DateTime.UtcNow);
        }

        private string BuildVerificationLink(string rawToken)
        {
            var publicUrl = _config["App:PublicUrl"]
                ?? _config["Frontend:PublicUrl"]
                ?? _config["Frontend:BaseUrl"];

            if (!Uri.TryCreate(publicUrl, UriKind.Absolute, out var baseUri))
                throw new InvalidOperationException("Frontend public URL is not configured.");

            var relativePath = _options.VerificationPath.TrimStart('/');
            var relativeUri = $"{relativePath}?token={WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(rawToken))}";
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
