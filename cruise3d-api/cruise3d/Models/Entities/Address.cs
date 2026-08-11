namespace cruise3d.Models.Entities
{
    public class Address
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }           // FK → users.id
        public string FullName { get; set; } = string.Empty;
        public string AddressLine { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string Pincode { get; set; } = string.Empty;
        public bool IsDefault { get; set; } = false;

        public User User { get; set; } = null!;
    }
}
