using cruise3d.API.Models.DTOs.Contact;
using cruise3d.API.Repositories.Interfaces;
using cruise3d.API.Services.Interfaces;
using cruise3d.Models.Entities;

namespace cruise3d.API.Services;

public class ContactMessageService : IContactMessageService
{
    private readonly IContactMessageRepository _contactMessages;

    public ContactMessageService(IContactMessageRepository contactMessages)
    {
        _contactMessages = contactMessages;
    }

    public async Task<IEnumerable<ContactMessageResponseDto>> GetAllAsync()
    {
        var messages = await _contactMessages.GetAllAsync();
        return messages.Select(MapToResponse);
    }

    public async Task<ContactMessageResponseDto> CreateAsync(ContactMessageCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FullName))
            throw new Exception("Full name is required.");

        if (string.IsNullOrWhiteSpace(dto.Email))
            throw new Exception("Email is required.");

        if (string.IsNullOrWhiteSpace(dto.Subject))
            throw new Exception("Subject is required.");

        if (string.IsNullOrWhiteSpace(dto.Message))
            throw new Exception("Message is required.");

        var contactMessage = new ContactMessage
        {
            Id = Guid.NewGuid(),
            FullName = dto.FullName.Trim(),
            Email = dto.Email.Trim().ToLowerInvariant(),
            Subject = dto.Subject.Trim(),
            Message = dto.Message.Trim(),
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        var created = await _contactMessages.CreateAsync(contactMessage);

        return MapToResponse(created);
    }

    private static ContactMessageResponseDto MapToResponse(ContactMessage message) => new()
    {
        Id = message.Id,
        FullName = message.FullName,
        Email = message.Email,
        Subject = message.Subject,
        Message = message.Message,
        CreatedAt = message.CreatedAt,
        IsRead = message.IsRead
    };
}
