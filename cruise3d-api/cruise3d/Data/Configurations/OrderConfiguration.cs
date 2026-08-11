// Data/Configurations/OrderConfiguration.cs

using cruise3d.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace cruise3d.API.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> entity)
    {
        entity.ToTable("orders");

        entity.HasKey(o => o.Id);

        entity.Property(o => o.Id)
              .HasDefaultValueSql("gen_random_uuid()");

        entity.Property(o => o.Subtotal)
              .HasPrecision(10, 2);

        entity.Property(o => o.ShippingCharge)
              .HasPrecision(10, 2)
              .HasDefaultValue(0);

        entity.Property(o => o.TotalAmount)
              .HasPrecision(10, 2);

        entity.Property(o => o.Status)
              .IsRequired()
              .HasMaxLength(20)
              .HasDefaultValue("pending");

        entity.HasCheckConstraint(
            "chk_orders_status",
            "status IN ('pending','confirmed','printing','shipped','delivered','cancelled')"
        );

        entity.Property(o => o.PaymentStatus)
              .IsRequired()
              .HasMaxLength(20)
              .HasDefaultValue("unpaid");

        entity.HasCheckConstraint(
            "chk_orders_payment_status",
            "payment_status IN ('unpaid','paid','refunded')"
        );

        entity.Property(o => o.PaymentId)
              .HasMaxLength(255);

        entity.Property(o => o.PaymentProvider)
              .HasMaxLength(50);

        entity.Property(o => o.RazorpayOrderId)
              .HasMaxLength(100);

        entity.HasIndex(o => o.RazorpayOrderId)
              .IsUnique()
              .HasFilter("razorpay_order_id IS NOT NULL");

        entity.Property(o => o.RazorpayPaymentId)
              .HasMaxLength(100);

        entity.Property(o => o.PlacedAt)
              .HasDefaultValueSql("NOW()");

        entity.Property(o => o.UpdatedAt)
              .HasDefaultValueSql("NOW()");

        // one User → many Orders
        // Restrict = cannot delete a user who has placed orders
        entity.HasOne(o => o.Customer)
              .WithMany(u => u.Orders)
              .HasForeignKey(o => o.CustomerId)
              .OnDelete(DeleteBehavior.Restrict);

        // one Address → many Orders
        // Restrict = cannot delete an address that was used in an order
        entity.HasOne(o => o.Address)
              .WithMany()
              .HasForeignKey(o => o.AddressId)
              .OnDelete(DeleteBehavior.Restrict);
    }
}