// Data/Configurations/OfferConfiguration.cs

using cruise3d.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace cruise3d.API.Data.Configurations;

public class OfferConfiguration : IEntityTypeConfiguration<Offer>
{
    public void Configure(EntityTypeBuilder<Offer> entity)
    {
        entity.ToTable("offers");

        entity.HasKey(o => o.Id);

        entity.Property(o => o.Id)
              .HasDefaultValueSql("gen_random_uuid()");

        entity.Property(o => o.Message)
              .IsRequired()
              .HasMaxLength(1000);

        entity.Property(o => o.StartDate)
              .IsRequired();

        entity.Property(o => o.EndDate)
              .IsRequired();

        entity.Property(o => o.IsActive)
              .HasDefaultValue(true);

        entity.Property(o => o.CreatedAt)
              .HasDefaultValueSql("NOW()");

        entity.Property(o => o.UpdatedAt)
              .HasDefaultValueSql("NOW()");
    }
}
