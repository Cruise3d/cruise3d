using cruise3d.API.Models.DTOs.Contact;

namespace cruise3d.API.Services.Interfaces;

public interface IContactMessageService
{
    Task<IEnumerable<ContactMessageResponseDto>> GetAllAsync();
    Task<ContactMessageResponseDto> CreateAsync(ContactMessageCreateDto dto);
}
