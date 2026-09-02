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

        public async Task<bool> ConsumeAsync(string tokenHash, DateTime consumedAt, DateTime utcNow)
        {
            var token = await _db.EmailVerificationTokens
                .FirstOrDefaultAsync(x => x.TokenHash == tokenHash);

            if (token == null)
                return false;

            if (token.UsedAt != null || token.RevokedAt != null || token.ExpiresAt <= utcNow)
                return false;

            token.UsedAt = consumedAt;
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
