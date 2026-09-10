using System.ComponentModel.DataAnnotations;

namespace cruise3d.API.Models.DTOs.Contact;

public class ContactMessageCreateDto
{
    [Required(ErrorMessage = "Full name is required.")]
    [MaxLength(100, ErrorMessage = "Full name cannot exceed 100 characters.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "A valid email address is required.")]
    [MaxLength(255, ErrorMessage = "Email cannot exceed 255 characters.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Subject is required.")]
    [MaxLength(255, ErrorMessage = "Subject cannot exceed 255 characters.")]
    public string Subject { get; set; } = string.Empty;

    [Required(ErrorMessage = "Message is required.")]
    [MaxLength(5000, ErrorMessage = "Message cannot exceed 5000 characters.")]
    public string Message { get; set; } = string.Empty;
}
