// Data/Configurations/AddressConfiguration.cs

using cruise3d.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace cruise3d.API.Data.Configurations;

public class AddressConfiguration : IEntityTypeConfiguration<Address>
{
    public void Configure(EntityTypeBuilder<Address> entity)
    {
        entity.ToTable("addresses");

        entity.HasKey(a => a.Id);

        entity.Property(a => a.Id)
              .HasDefaultValueSql("gen_random_uuid()");
        entity.Property(a => a.Id)
              .HasColumnName("id");

        entity.Property(a => a.FullName)
              .IsRequired()
              .HasMaxLength(100)
              .HasColumnName("full_name");

        entity.Property(a => a.AddressLine)
              .IsRequired()
              .HasColumnName("address_line");

        entity.Property(a => a.City)
              .IsRequired()
              .HasMaxLength(100)
              .HasColumnName("city");

        entity.Property(a => a.State)
              .IsRequired()
              .HasMaxLength(100)
              .HasColumnName("state");

        entity.Property(a => a.Pincode)
              .IsRequired()
              .HasMaxLength(10)
              .HasColumnName("pincode");

        // Nullable for legacy rows; new-address DTOs require a valid phone.
        entity.Property(a => a.Phone)
              .HasMaxLength(20)
              .HasColumnName("phone");

        entity.Property(a => a.IsDefault)
              .HasDefaultValue(false)
              .HasColumnName("is_default");

        entity.HasIndex(a => a.UserId)
              .IsUnique()
              .HasDatabaseName("ix_addresses_one_default_per_user")
              .HasFilter("is_default = TRUE");

        // one User → many Addresses
        // if user deleted → addresses deleted too
        entity.HasOne(a => a.User)
              .WithMany(u => u.Addresses)
              .HasForeignKey(a => a.UserId)
              .OnDelete(DeleteBehavior.Cascade);
    }
}