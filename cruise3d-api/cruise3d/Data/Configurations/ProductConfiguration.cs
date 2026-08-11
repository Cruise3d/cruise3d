// Data/Configurations/ProductConfiguration.cs

using cruise3d.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace cruise3d.API.Data.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> entity)
    {
        // configure check constraints via the ToTable(Action<RelationalEntityTypeBuilder>) API
        entity.ToTable(tb =>
        {
            tb.HasCheckConstraint(
                "chk_products_price",
                "price >= 0"
            );

            tb.HasCheckConstraint(
                "chk_products_stock",
                "stock >= 0"
            );

            tb.HasCheckConstraint(
                "chk_products_color_type",
                "color_type IN ('custom', 'fixed')"
            );
        });
        // ensure table name is set to 'products'
        entity.Metadata.SetTableName("products");

        entity.HasKey(p => p.Id);

        entity.Property(p => p.Id)
              .HasDefaultValueSql("gen_random_uuid()");

        entity.Property(p => p.Title)
              .IsRequired()
              .HasMaxLength(255);

        entity.Property(p => p.Sku)
              .IsRequired()
              .HasMaxLength(100);

        entity.HasIndex(p => p.Sku)
              .IsUnique();

        entity.Property(p => p.Price)
              .HasPrecision(10, 2);


        entity.Property(p => p.Stock)
              .HasDefaultValue(0);


        entity.Property(p => p.Material)
              .HasMaxLength(100);

        entity.Property(p => p.Dimensions)
              .HasMaxLength(100);

        entity.Property(p => p.EstimatedDelivery)
              .HasMaxLength(100);

        entity.Property(p => p.ColorType)
              .IsRequired()
              .HasMaxLength(10)
              .HasDefaultValue("fixed");

        // check constraints configured on the table level above

        entity.Property(p => p.DefaultColorName)
              .HasMaxLength(50);

        entity.Property(p => p.DefaultColorHex)
              .HasMaxLength(7);

        entity.Property(p => p.IsFeatured)
              .HasDefaultValue(false);

        entity.Property(p => p.IsBestseller)
              .HasDefaultValue(false);

        entity.Property(p => p.IsActive)
              .HasDefaultValue(true);

        entity.Property(p => p.CreatedAt)
              .HasDefaultValueSql("NOW()");

        entity.Property(p => p.UpdatedAt)
              .HasDefaultValueSql("NOW()");

        // one Category → many Products
        // if category deleted → product stays, CategoryId becomes NULL
        entity.HasOne(p => p.Category)
              .WithMany(c => c.Products)
              .HasForeignKey(p => p.CategoryId)
              .OnDelete(DeleteBehavior.SetNull);

        // (global query filter removed to avoid hiding products referenced by related rows)
    }
}