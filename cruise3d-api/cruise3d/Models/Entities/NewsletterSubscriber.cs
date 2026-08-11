using System;

namespace cruise3d.Models.Entities
{
    public class NewsletterSubscriber
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime SubscribedAt { get; set; }
    }
}
