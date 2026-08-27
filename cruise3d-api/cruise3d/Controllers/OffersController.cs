using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using cruise3d.API.Models.DTOs.Common;
using cruise3d.API.Models.DTOs.Offer;
using cruise3d.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace cruise3d.API.Controllers;

[ApiController]
[Route("api/offers")]
public class OffersController : ControllerBase
{
    private readonly IOfferService _offers;

    public OffersController(IOfferService offers)
    {
        _offers = offers;
    }

    // GET api/offers/active
    // Public — retrieves the current active offer. Returns 200 with `data: null`
    // when no offer is currently active so the storefront banner can render
    // nothing cleanly instead of treating an empty state as an error.
    [HttpGet("active")]
    public async Task<IActionResult> GetActive()
    {
        var result = await _offers.GetActiveAsync();
        return Ok(ApiResponse<OfferResponseDto?>.Ok(result));
    }

    // GET api/offers
    // Admin only — list all offers
    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _offers.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<OfferResponseDto>>.Ok(result));
    }

    // GET api/offers/{id}
    // Admin only — get offer by id
    [HttpGet("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _offers.GetByIdAsync(id);
        return Ok(ApiResponse<OfferResponseDto>.Ok(result));
    }

    // POST api/offers
    // Admin only — create new offer
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] OfferCreateDto dto)
    {
        var result = await _offers.CreateAsync(dto);
        return CreatedAtAction(
            nameof(GetById),
            new { id = result.Id },
            ApiResponse<OfferResponseDto>.Ok(result, "Offer created successfully.")
        );
    }

    // PUT api/offers/{id}
    // Admin only — update offer
    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] OfferUpdateDto dto)
    {
        var result = await _offers.UpdateAsync(id, dto);
        return Ok(ApiResponse<OfferResponseDto>.Ok(result, "Offer updated successfully."));
    }

    // DELETE api/offers/{id}
    // Admin only — delete offer
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _offers.DeleteAsync(id);
        return Ok(ApiResponse<string>.Ok("Offer deleted.", "Offer deleted successfully."));
    }
}
