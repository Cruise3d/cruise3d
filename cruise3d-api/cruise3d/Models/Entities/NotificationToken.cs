using System;
using System.Collections.Generic;

namespace cruise3d.Models.Entities
{
    public class NotificationToken
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public string Token { get; set; } = string.Empty;
        public string Platform { get; set; } = "web";
        public string? UserAgent { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastSeenAt { get; set; }
        public bool Muted { get; set; }
    }
}
