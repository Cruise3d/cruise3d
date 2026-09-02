using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using cruise3d.API.Data;
using cruise3d.API.Repositories.Interfaces;
using cruise3d.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace cruise3d.API.Repositories
{
    public class EmailVerificationTokenRepository : IEmailVerificationTokenRepository
    {
        private readonly AppDbContext _db;

        public EmailVerificationTokenRepository(AppDbContext db) => _db = db;

        public async Task<EmailVerificationToken?> GetByTokenHashAsync(string tokenHash)
        {
            return await _db.EmailVerificationTokens
                .FirstOrDefaultAsync(x => x.TokenHash == tokenHash);
        }

        public async Task<List<EmailVerificationToken>> GetActiveByUserIdAsync(Guid userId)
        {
            return await _db.EmailVerificationTokens
                .Where(x => x.UserId == userId && x.UsedAt == null && x.RevokedAt == null)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<EmailVerificationToken> CreateAsync(EmailVerificationToken token)
        {
            _db.EmailVerificationTokens.Add(token);
            await _db.SaveChangesAsync();
            return token;
        }

        public async Task UpdateAsync(EmailVerificationToken token)
        {
            _db.EmailVerificationTokens.Update(token);
            await _db.SaveChangesAsync();
        }

        public async Task RevokeActiveByUserIdAsync(Guid userId, DateTime revokedAt)
        {
            var activeTokens = await _db.EmailVerificationTokens
                .Where(x => x.UserId == userId && x.UsedAt == null && x.RevokedAt == null)
                .ToListAsync();

            if (activeTokens.Count == 0)
                return;

            foreach (var token in activeTokens)
                token.RevokedAt = revokedAt;

            await _db.SaveChangesAsync();
        }

        public async Task<Guid?> ValidateAndConsumeAsync(
            string tokenHash,
            DateTime consumedAt,
            CancellationToken cancellationToken = default)
        {
            await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);

            var token = await _db.EmailVerificationTokens
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.TokenHash == tokenHash, cancellationToken);

            if (token == null)
                return null;

            var consumed = await _db.EmailVerificationTokens
                .Where(x => x.TokenHash == tokenHash &&
                            x.UsedAt == null &&
                            x.RevokedAt == null &&
                            x.ExpiresAt > consumedAt)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(x => x.UsedAt, consumedAt), cancellationToken);

            if (consumed != 1)
                return null;

            var verified = await _db.Users
                .Where(x => x.Id == token.UserId && !x.IsEmailVerified)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(x => x.IsEmailVerified, true)
                    .SetProperty(x => x.EmailVerifiedAt, consumedAt)
                    .SetProperty(x => x.UpdatedAt, consumedAt), cancellationToken);

            if (verified != 1)
            {
                var userExists = await _db.Users.AnyAsync(x => x.Id == token.UserId, cancellationToken);
                if (!userExists)
                    return null;
            }

            await transaction.CommitAsync(cancellationToken);
            return token.UserId;
        }
    }
}
