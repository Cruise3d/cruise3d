using System.ComponentModel.DataAnnotations;

namespace cruise3d.API.Models.DTOs.Address;

public class CreateAddressDto
{
    [Required(ErrorMessage = "Full name is required")]
    [MaxLength(100, ErrorMessage = "Full name cannot exceed 100 characters")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Address line is required")]
    public string AddressLine { get; set; } = string.Empty;

    [Required(ErrorMessage = "City is required")]
    [MaxLength(100, ErrorMessage = "City cannot exceed 100 characters")]
    public string City { get; set; } = string.Empty;

    [Required(ErrorMessage = "State is required")]
    [MaxLength(100, ErrorMessage = "State cannot exceed 100 characters")]
    public string State { get; set; } = string.Empty;

    [Required(ErrorMessage = "Pincode is required")]
    [MaxLength(10, ErrorMessage = "Pincode cannot exceed 10 characters")]
    public string Pincode { get; set; } = string.Empty;
}

public class AddressResponseDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string AddressLine { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Pincode { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
}
