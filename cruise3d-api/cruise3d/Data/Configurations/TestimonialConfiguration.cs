using cruise3d.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class TestimonialConfiguration : IEntityTypeConfiguration<Testimonial>
{
    public void Configure(EntityTypeBuilder<Testimonial> entity)
    {
        entity.ToTable("testimonials");

        entity.HasKey(t => t.Id);

        entity.Property(t => t.Id)
              .HasDefaultValueSql("gen_random_uuid()");

        entity.Property(t => t.Content)
              .IsRequired();

        entity.HasCheckConstraint(
            "chk_testimonials_rating",
            "rating BETWEEN 1 AND 5"
        );

        entity.Property(t => t.IsFeatured)
              .HasDefaultValue(false);

        entity.Property(t => t.CreatedAt)
              .HasDefaultValueSql("NOW()");

        // CustomerId is nullable — admin can add testimonials manually
        // if customer deleted → testimonial stays, CustomerId becomes NULL
        entity.HasOne(t => t.Customer)
              .WithMany()
              .HasForeignKey(t => t.CustomerId)
              .OnDelete(DeleteBehavior.SetNull);
    }
}