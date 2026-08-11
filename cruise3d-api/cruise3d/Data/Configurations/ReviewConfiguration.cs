// Data/Configurations/ReviewConfiguration.cs

using cruise3d.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace cruise3d.API.Data.Configurations;

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> entity)
    {
        entity.ToTable("reviews");

        entity.HasKey(r => r.Id);

        entity.Property(r => r.Id)
              .HasDefaultValueSql("gen_random_uuid()");

        entity.Property(r => r.Rating)
              .IsRequired();

        entity.HasCheckConstraint(
            "chk_reviews_rating",
            "rating BETWEEN 1 AND 5"
        );

        entity.Property(r => r.CreatedAt)
              .HasDefaultValueSql("NOW()");

        // one review per customer per product
        entity.HasIndex(r => new { r.CustomerId, r.ProductId })
              .IsUnique();

        // one Product → many Reviews
        entity.HasOne(r => r.Product)
              .WithMany(p => p.Reviews)
              .HasForeignKey(r => r.ProductId)
              .OnDelete(DeleteBehavior.Cascade);

        // one User → many Reviews
        // Restrict = cannot delete a customer who has written reviews
        entity.HasOne(r => r.Customer)
              .WithMany(u => u.Reviews)
              .HasForeignKey(r => r.CustomerId)
              .OnDelete(DeleteBehavior.Restrict);

        // one Order → many Reviews
        // Restrict = cannot delete an order that has a review
        entity.HasOne(r => r.Order)
              .WithMany()
              .HasForeignKey(r => r.OrderId)
              .OnDelete(DeleteBehavior.Restrict);
    }
}