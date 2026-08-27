using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using cruise3d.Models.Entities;

namespace cruise3d.API.Repositories.Interfaces
{
    public interface IOfferRepository
    {
        Task<IEnumerable<Offer>> GetAllAsync();
        Task<Offer?> GetByIdAsync(Guid id);
        Task<Offer?> GetActiveAsync();
        Task<Offer> CreateAsync(Offer offer);
        Task UpdateAsync(Offer offer);
        Task DeleteAsync(Guid id);
    }
}
