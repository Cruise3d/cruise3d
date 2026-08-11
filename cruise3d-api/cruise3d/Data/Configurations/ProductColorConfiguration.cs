// Data/Configurations/ProductColorConfiguration.cs

using cruise3d.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace cruise3d.API.Data.Configurations;

public class ProductColorConfiguration : IEntityTypeConfiguration<ProductColor>
{
    public void Configure(EntityTypeBuilder<ProductColor> entity)
    {
        entity.ToTable("product_colors");

        entity.HasKey(pc => pc.Id);

        entity.Property(pc => pc.Id)
              .HasDefaultValueSql("gen_random_uuid()");

        entity.Property(pc => pc.ColorName)
              .IsRequired()
              .HasMaxLength(50);

        entity.Property(pc => pc.ColorHex)
              .IsRequired()
              .HasMaxLength(7);

        entity.HasCheckConstraint(
            "chk_product_colors_stock",
            "stock_override >= 0"
        );

        entity.Property(pc => pc.SortOrder)
              .HasDefaultValue(0);

        // same product can't have two colors with the same name
        entity.HasIndex(pc => new { pc.ProductId, pc.ColorName })
              .IsUnique();

        // one Product → many ProductColors
        // if product deleted → colors deleted too
        entity.HasOne(pc => pc.Product)
              .WithMany(p => p.Colors)
              .HasForeignKey(pc => pc.ProductId)
              .OnDelete(DeleteBehavior.Cascade);
    }
}