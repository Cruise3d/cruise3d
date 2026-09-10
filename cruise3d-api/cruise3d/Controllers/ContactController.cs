using cruise3d.API.Models.DTOs.Common;
using cruise3d.API.Models.DTOs.Contact;
using cruise3d.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace cruise3d.API.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController : ControllerBase
{
    private readonly IContactMessageService _contactMessages;

    public ContactController(IContactMessageService contactMessages)
    {
        _contactMessages = contactMessages;
    }

    [HttpGet("messages")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetMessages()
    {
        var result = await _contactMessages.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<ContactMessageResponseDto>>.Ok(result));
    }

    [HttpPost("messages")]
    public async Task<IActionResult> CreateMessage([FromBody] ContactMessageCreateDto dto)
    {
        var result = await _contactMessages.CreateAsync(dto);
        return Ok(ApiResponse<ContactMessageResponseDto>.Ok(
            result,
            "Contact message submitted successfully."));
    }
}
