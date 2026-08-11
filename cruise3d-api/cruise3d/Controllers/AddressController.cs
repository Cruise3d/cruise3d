using cruise3d.API.Helpers;
using cruise3d.API.Models.DTOs.Address;
using cruise3d.API.Models.DTOs.Common;
using cruise3d.API.Repositories.Interfaces;
using cruise3d.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace cruise3d.API.Controllers;

[ApiController]
[Route("api/addresses")]
[Authorize(Roles = "customer")]
public class AddressController : ControllerBase
{
    private readonly IAddressRepository _addresses;

    public AddressController(IAddressRepository addresses)
        => _addresses = addresses;

    // POST api/addresses
    // Customer saves a shipping address for checkout
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAddressDto dto)
    {
        var userId = JwtHelper.GetUserId(User);

        var address = new Address
        {
            UserId = userId,
            FullName = dto.FullName,
            AddressLine = dto.AddressLine,
            City = dto.City,
            State = dto.State,
            Pincode = dto.Pincode
        };

        var created = await _addresses.CreateAsync(address);

        var response = new AddressResponseDto
        {
            Id = created.Id,
            FullName = created.FullName,
            AddressLine = created.AddressLine,
            City = created.City,
            State = created.State,
            Pincode = created.Pincode,
            IsDefault = created.IsDefault
        };

        return Ok(ApiResponse<AddressResponseDto>.Ok(response, "Address created successfully."));
    }
}
