using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using cruise3d.Models.Entities;
using cruise3d.API.Repositories.Interfaces;
using cruise3d.API.Data;
using Microsoft.EntityFrameworkCore;

namespace cruise3d.API.Repositories
{
    public class NotificationTokenRepository : INotificationTokenRepository
    {
        private readonly AppDbContext _db;
        public NotificationTokenRepository(AppDbContext db) => _db = db;

        public async Task UpsertAsync(Guid userId, string token, string platform, string? userAgent)
        {
            var existing = await _db.NotificationTokens.FirstOrDefaultAsync(x => x.Token == token);
            if (existing != null)
            {
                existing.LastSeenAt = DateTime.UtcNow;
                // Refresh ownership if a different user re-registers the same browser
                if (existing.UserId != userId)
                {
                    existing.UserId = userId;
                    existing.Platform = platform;
                    existing.UserAgent = userAgent;
                }
            }
            else
            {
                _db.NotificationTokens.Add(new NotificationToken
                {
                    UserId = userId,
                    Token = token,
                    Platform = platform,
                    UserAgent = userAgent,
                    CreatedAt = DateTime.UtcNow,
                    LastSeenAt = DateTime.UtcNow
                });
            }
            await _db.SaveChangesAsync();
        }

        public async Task DeleteByTokenAsync(string token)
        {
            var row = await _db.NotificationTokens.FirstOrDefaultAsync(x => x.Token == token);
            if (row != null)
            {
                _db.NotificationTokens.Remove(row);
                await _db.SaveChangesAsync();
            }
        }

        public async Task<List<string>> GetByUserIdAsync(Guid userId)
        {
            return await _db.NotificationTokens
                .Where(t => !t.Muted && t.UserId == userId)
                .Select(t => t.Token)
                .ToListAsync();
        }

        public async Task<List<string>> GetAllAdminTokensAsync()
        {
            return await _db.NotificationTokens
                .Where(t => !t.Muted && t.User.Role == "admin")
                .Select(t => t.Token)
                .ToListAsync();
        }

        public async Task RemoveInvalidAsync(IEnumerable<string> tokens)
        {
            var tokenList = tokens.ToList();
            if (tokenList.Count == 0) return;
            var rows = await _db.NotificationTokens
                .Where(t => tokenList.Contains(t.Token))
                .ToListAsync();
            if (rows.Count == 0) return;
            _db.NotificationTokens.RemoveRange(rows);
            await _db.SaveChangesAsync();
        }

        public async Task<List<string>> GetStaleTokensAsync(DateTime olderThan)
        {
            return await _db.NotificationTokens
                .Where(t => t.LastSeenAt < olderThan)
                .Select(t => t.Token)
                .ToListAsync();
        }

        public async Task SetMutedAsync(string token, bool muted)
        {
            var row = await _db.NotificationTokens.FirstOrDefaultAsync(x => x.Token == token);
            if (row == null) return;
            row.Muted = muted;
            await _db.SaveChangesAsync();
        }
    }
}
