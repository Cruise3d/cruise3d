// Data/Configurations/CartConfiguration.cs

using cruise3d.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace cruise3d.API.Data.Configurations;

public class CartConfiguration : IEntityTypeConfiguration<Cart>
{
    public void Configure(EntityTypeBuilder<Cart> entity)
    {
        entity.ToTable("carts");

        entity.HasKey(c => c.Id);

        entity.Property(c => c.Id)
              .HasDefaultValueSql("gen_random_uuid()");

        entity.Property(c => c.Quantity)
              .HasDefaultValue(1);

        entity.HasCheckConstraint(
            "chk_carts_quantity",
            "quantity > 0"
        );

        entity.Property(c => c.AddedAt)
              .HasDefaultValueSql("NOW()");

        // one row per user + product + color combination
        entity.HasIndex(c => new { c.UserId, c.ProductId, c.ProductColorId })
              .IsUnique();

        // one User → many Cart rows
        entity.HasOne(c => c.User)
              .WithMany(u => u.Carts)
              .HasForeignKey(c => c.UserId)
              .OnDelete(DeleteBehavior.Cascade);

        // one Product → many Cart rows
        entity.HasOne(c => c.Product)
              .WithMany()
              .HasForeignKey(c => c.ProductId)
              .OnDelete(DeleteBehavior.Cascade);

        // one ProductColor → many Cart rows (nullable)
        entity.HasOne(c => c.ProductColor)
              .WithMany()
              .HasForeignKey(c => c.ProductColorId)
              .OnDelete(DeleteBehavior.SetNull);
    }
}