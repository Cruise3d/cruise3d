// Data/Configurations/ProductSpecConfiguration.cs

using cruise3d.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace cruise3d.API.Data.Configurations;

public class ProductSpecConfiguration : IEntityTypeConfiguration<ProductSpec>
{
    public void Configure(EntityTypeBuilder<ProductSpec> entity)
    {
        entity.ToTable("product_specs");

        entity.HasKey(ps => ps.Id);

        entity.Property(ps => ps.Id)
              .HasDefaultValueSql("gen_random_uuid()");

        entity.Property(ps => ps.SpecKey)
              .IsRequired()
              .HasMaxLength(100);

        entity.Property(ps => ps.SpecValue)
              .IsRequired()
              .HasMaxLength(255);

        entity.Property(ps => ps.SortOrder)
              .HasDefaultValue(0);

        // one Product → many ProductSpecs
        // if product deleted → specs deleted too
        entity.HasOne(ps => ps.Product)
              .WithMany(p => p.Specs)
              .HasForeignKey(ps => ps.ProductId)
              .OnDelete(DeleteBehavior.Cascade);
    }
}