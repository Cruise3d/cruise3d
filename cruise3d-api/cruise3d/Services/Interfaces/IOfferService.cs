using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using cruise3d.API.Models.DTOs.Offer;

namespace cruise3d.API.Services.Interfaces;

public interface IOfferService
{
    Task<IEnumerable<OfferResponseDto>> GetAllAsync();
    Task<OfferResponseDto> GetByIdAsync(Guid id);
    Task<OfferResponseDto?> GetActiveAsync();
    Task<OfferResponseDto> CreateAsync(OfferCreateDto dto);
    Task<OfferResponseDto> UpdateAsync(Guid id, OfferUpdateDto dto);
    Task DeleteAsync(Guid id);
}
