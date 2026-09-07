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

    [HttpGet]
    public async Task<IActionResult> GetMine()
    {
        var userId = JwtHelper.GetUserId(User);
        var addresses = await _addresses.GetByUserIdAsync(userId);
        return Ok(ApiResponse<IEnumerable<AddressResponseDto>>.Ok(addresses.Select(ToResponse)));
    }

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
            Pincode = dto.Pincode,
            Phone = dto.Phone.Trim(),
            IsDefault = dto.IsDefault
        };

        var created = await _addresses.CreateAsync(address);

        return Ok(ApiResponse<AddressResponseDto>.Ok(ToResponse(created), "Address created successfully."));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAddressDto dto)
    {
        var userId = JwtHelper.GetUserId(User);
        var address = await _addresses.GetByIdAsync(id);
        if (address == null || address.UserId != userId)
            return NotFound(ApiResponse<object>.Fail("Address not found."));

        address.FullName = dto.FullName;
        address.AddressLine = dto.AddressLine;
        address.City = dto.City;
        address.State = dto.State;
        address.Pincode = dto.Pincode;
        address.Phone = dto.Phone.Trim();
        address.IsDefault = dto.IsDefault;
        await _addresses.UpdateAsync(address);

        return Ok(ApiResponse<AddressResponseDto>.Ok(ToResponse(address), "Address updated successfully."));
    }

    [HttpPut("{id:guid}/default")]
    public async Task<IActionResult> SetDefault(Guid id)
    {
        var userId = JwtHelper.GetUserId(User);
        var address = await _addresses.GetByIdAsync(id);
        if (address == null || address.UserId != userId)
            return NotFound(ApiResponse<object>.Fail("Address not found."));

        await _addresses.SetDefaultAsync(address);
        address.IsDefault = true;
        return Ok(ApiResponse<AddressResponseDto>.Ok(ToResponse(address), "Default address updated."));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = JwtHelper.GetUserId(User);
        var address = await _addresses.GetByIdAsync(id);
        if (address == null || address.UserId != userId)
            return NotFound(ApiResponse<object>.Fail("Address not found."));

        await _addresses.DeleteAsync(id);
        return Ok(ApiResponse<object>.Ok(null, "Address deleted successfully."));
    }

    private static AddressResponseDto ToResponse(Address address) => new()
    {
        Id = address.Id,
        FullName = address.FullName,
        AddressLine = address.AddressLine,
        City = address.City,
        State = address.State,
        Pincode = address.Pincode,
        Phone = address.Phone,
        IsDefault = address.IsDefault
    };
}
