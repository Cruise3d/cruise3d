using System;

namespace cruise3d.Models.Entities
{
    // Models/Entities/Offer.cs
    public class Offer
    {
        public Guid Id { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
