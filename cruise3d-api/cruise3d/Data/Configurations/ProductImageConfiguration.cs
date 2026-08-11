// Data/Configurations/ProductImageConfiguration.cs

using cruise3d.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace cruise3d.API.Data.Configurations;

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> entity)
    {
        entity.ToTable("product_images");

        entity.HasKey(pi => pi.Id);

        entity.Property(pi => pi.Id)
              .HasDefaultValueSql("gen_random_uuid()");

        entity.Property(pi => pi.Url)
              .IsRequired()
              .HasMaxLength(500);

        entity.Property(pi => pi.IsPrimary)
              .HasDefaultValue(false);

        entity.Property(pi => pi.SortOrder)
              .HasDefaultValue(0);

        // one Product → many ProductImages
        // if product deleted → images deleted too
        entity.HasOne(pi => pi.Product)
              .WithMany(p => p.Images)
              .HasForeignKey(pi => pi.ProductId)
              .OnDelete(DeleteBehavior.Cascade);

        // one ProductColor → many ProductImages (nullable)
        // if color deleted → image stays, ProductColorId becomes NULL
        entity.HasOne(pi => pi.ProductColor)
              .WithMany(pc => pc.Images)
              .HasForeignKey(pi => pi.ProductColorId)
              .OnDelete(DeleteBehavior.SetNull);
    }
}