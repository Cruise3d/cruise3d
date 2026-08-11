using System;

namespace cruise3d.Models.Entities
{
    public class Testimonial
    {
        public Guid Id { get; set; }
        public Guid? CustomerId { get; set; }      // nullable — admin can add manually
        public string Content { get; set; } = string.Empty;
        public int? Rating { get; set; }
        public bool IsFeatured { get; set; }
        public DateTime CreatedAt { get; set; }

        public User? Customer { get; set; }
    }
}
