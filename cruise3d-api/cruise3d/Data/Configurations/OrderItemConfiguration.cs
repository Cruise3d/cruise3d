// Data/Configurations/OrderItemConfiguration.cs

using cruise3d.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace cruise3d.API.Data.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> entity)
    {
        entity.ToTable("order_items");

        entity.HasKey(oi => oi.Id);

        entity.Property(oi => oi.Id)
              .HasDefaultValueSql("gen_random_uuid()");

        entity.Property(oi => oi.ColorNameSnapshot)
              .HasMaxLength(50);

        entity.Property(oi => oi.ColorHexSnapshot)
              .HasMaxLength(7);

        entity.Property(oi => oi.Quantity)
              .IsRequired();

        entity.HasCheckConstraint(
            "chk_order_items_quantity",
            "quantity > 0"
        );

        entity.Property(oi => oi.PriceAtPurchase)
              .HasPrecision(10, 2);

        // one Order → many OrderItems
        // if order deleted → items deleted too
        entity.HasOne(oi => oi.Order)
              .WithMany(o => o.Items)
              .HasForeignKey(oi => oi.OrderId)
              .OnDelete(DeleteBehavior.Cascade);

        // one Product → many OrderItems
        // Restrict = cannot delete a product that exists in an order
        entity.HasOne(oi => oi.Product)
              .WithMany()
              .HasForeignKey(oi => oi.ProductId)
              .OnDelete(DeleteBehavior.Restrict);

        // one ProductColor → many OrderItems (nullable)
        // if color deleted → snapshot columns still hold the color info
        entity.HasOne(oi => oi.ProductColor)
              .WithMany()
              .HasForeignKey(oi => oi.ProductColorId)
              .OnDelete(DeleteBehavior.SetNull);
    }
}