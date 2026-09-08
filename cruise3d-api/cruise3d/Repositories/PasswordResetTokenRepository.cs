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
    public class PasswordResetTokenRepository : IPasswordResetTokenRepository
    {
        private readonly AppDbContext _db;

        public PasswordResetTokenRepository(AppDbContext db) => _db = db;

        public async Task<PasswordResetToken?> GetByTokenHashAsync(string tokenHash)
        {
            return await _db.PasswordResetTokens
                .FirstOrDefaultAsync(x => x.TokenHash == tokenHash);
        }

        public async Task<List<PasswordResetToken>> GetActiveByUserIdAsync(Guid userId)
        {
            return await _db.PasswordResetTokens
                .Where(x => x.UserId == userId && x.UsedAt == null && x.RevokedAt == null)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<PasswordResetToken> CreateAsync(PasswordResetToken token)
        {
            _db.PasswordResetTokens.Add(token);
            await _db.SaveChangesAsync();
            return token;
        }

        public async Task UpdateAsync(PasswordResetToken token)
        {
            _db.PasswordResetTokens.Update(token);
            await _db.SaveChangesAsync();
        }

        public async Task RevokeActiveByUserIdAsync(Guid userId, DateTime revokedAt)
        {
            var activeTokens = await _db.PasswordResetTokens
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

            var token = await _db.PasswordResetTokens
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.TokenHash == tokenHash, cancellationToken);

            if (token == null)
                return null;

            var consumed = await _db.PasswordResetTokens
                .Where(x => x.TokenHash == tokenHash &&
                            x.UsedAt == null &&
                            x.RevokedAt == null &&
                            x.ExpiresAt > consumedAt)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(x => x.UsedAt, consumedAt), cancellationToken);

            if (consumed != 1)
                return null;

            await transaction.CommitAsync(cancellationToken);
            return token.UserId;
        }
    }
}
