// Data/Configurations/PaymentConfiguration.cs

using cruise3d.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace cruise3d.API.Data.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> entity)
    {
        entity.ToTable("payments");

        entity.HasKey(p => p.Id);

        entity.Property(p => p.Id)
              .HasDefaultValueSql("gen_random_uuid()");

        entity.Property(p => p.RazorpayOrderId)
              .IsRequired()
              .HasMaxLength(100);

        // Each Razorpay order can be paid at most once
        entity.HasIndex(p => p.RazorpayOrderId)
              .IsUnique();

        entity.Property(p => p.RazorpayPaymentId)
              .HasMaxLength(100);

        // Each Razorpay payment id is unique
        entity.HasIndex(p => p.RazorpayPaymentId)
              .IsUnique();

        entity.Property(p => p.Amount)
              .HasPrecision(10, 2);

        entity.Property(p => p.Currency)
              .IsRequired()
              .HasMaxLength(10)
              .HasDefaultValue("INR");

        entity.Property(p => p.Provider)
              .IsRequired()
              .HasMaxLength(50)
              .HasDefaultValue("razorpay");

        entity.Property(p => p.Status)
              .IsRequired()
              .HasMaxLength(20)
              .HasDefaultValue("pending");

        entity.HasCheckConstraint(
            "chk_payments_status",
            "status IN ('pending','created','authorized','captured','paid','completed','failed','refunded')"
        );

        entity.Property(p => p.CreatedAt)
              .HasDefaultValueSql("NOW()");

        // one Order → many Payments (one order can have multiple payment attempts)
        entity.HasOne(p => p.Order)
              .WithMany()
              .HasForeignKey(p => p.OrderId)
              .OnDelete(DeleteBehavior.Cascade);

        // one User → many Payments
        entity.HasOne(p => p.User)
              .WithMany()
              .HasForeignKey(p => p.UserId)
              .OnDelete(DeleteBehavior.Restrict);
    }
}
