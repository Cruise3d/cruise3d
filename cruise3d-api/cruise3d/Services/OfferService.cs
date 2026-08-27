using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using cruise3d.API.Models.DTOs.Offer;
using cruise3d.Models.Entities;
using cruise3d.API.Repositories.Interfaces;
using cruise3d.API.Services.Interfaces;

namespace cruise3d.API.Services;

public class OfferService : IOfferService
{
    private readonly IOfferRepository _offers;

    public OfferService(IOfferRepository offers)
    {
        _offers = offers;
    }

    public async Task<IEnumerable<OfferResponseDto>> GetAllAsync()
    {
        var offers = await _offers.GetAllAsync();
        return offers.Select(MapToResponse);
    }

    public async Task<OfferResponseDto> GetByIdAsync(Guid id)
    {
        var offer = await _offers.GetByIdAsync(id)
            ?? throw new Exception("Offer not found.");
        return MapToResponse(offer);
    }

    public async Task<OfferResponseDto?> GetActiveAsync()
    {
        var offer = await _offers.GetActiveAsync();
        return offer is null ? null : MapToResponse(offer);
    }

    public async Task<OfferResponseDto> CreateAsync(OfferCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Message))
            throw new Exception("Invalid offer: Message is required and cannot be empty.");

        var startUtc = dto.StartDate.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc)
            : dto.StartDate.ToUniversalTime();

        var endUtc = dto.EndDate.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(dto.EndDate, DateTimeKind.Utc)
            : dto.EndDate.ToUniversalTime();

        if (endUtc <= startUtc)
            throw new Exception("Invalid offer: EndDate must be later than StartDate.");

        var offer = new Offer
        {
            Id        = Guid.NewGuid(),
            Message   = dto.Message.Trim(),
            StartDate = startUtc,
            EndDate   = endUtc,
            IsActive  = dto.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _offers.CreateAsync(offer);
        return MapToResponse(created);
    }

    public async Task<OfferResponseDto> UpdateAsync(Guid id, OfferUpdateDto dto)
    {
        var offer = await _offers.GetByIdAsync(id)
            ?? throw new Exception("Offer not found.");

        if (dto.Message != null)
        {
            if (string.IsNullOrWhiteSpace(dto.Message))
                throw new Exception("Invalid offer: Message is required and cannot be empty.");
            offer.Message = dto.Message.Trim();
        }
        if (dto.StartDate != null)
        {
            offer.StartDate = dto.StartDate.Value.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(dto.StartDate.Value, DateTimeKind.Utc)
                : dto.StartDate.Value.ToUniversalTime();
        }
        if (dto.EndDate != null)
        {
            offer.EndDate = dto.EndDate.Value.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(dto.EndDate.Value, DateTimeKind.Utc)
                : dto.EndDate.Value.ToUniversalTime();
        }
        if (dto.IsActive != null) offer.IsActive = dto.IsActive.Value;

        if (offer.EndDate <= offer.StartDate)
            throw new Exception("Invalid offer: EndDate must be later than StartDate.");

        offer.UpdatedAt = DateTime.UtcNow;

        await _offers.UpdateAsync(offer);
        return MapToResponse(offer);
    }

    public async Task DeleteAsync(Guid id)
    {
        var offer = await _offers.GetByIdAsync(id)
            ?? throw new Exception("Offer not found.");

        await _offers.DeleteAsync(id);
    }

    // ─── MAPPING HELPER ─────────────────────────────────────────────────────────

    private static OfferResponseDto MapToResponse(Offer o) => new()
    {
        Id        = o.Id,
        Message   = o.Message,
        StartDate = o.StartDate,
        EndDate   = o.EndDate,
        IsActive  = o.IsActive,
        CreatedAt = o.CreatedAt,
        UpdatedAt = o.UpdatedAt
    };
}
