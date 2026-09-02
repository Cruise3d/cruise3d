using System;

namespace cruise3d.Models.Entities
{
    public class EmailVerificationToken
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public string TokenHash { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime? UsedAt { get; set; }
        public DateTime? RevokedAt { get; set; }
    }
}
