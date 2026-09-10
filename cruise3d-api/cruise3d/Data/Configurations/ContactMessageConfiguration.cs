using cruise3d.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace cruise3d.API.Data.Configurations;

public class ContactMessageConfiguration : IEntityTypeConfiguration<ContactMessage>
{
    public void Configure(EntityTypeBuilder<ContactMessage> entity)
    {
        entity.ToTable("contact_messages");

        entity.HasKey(m => m.Id);

        entity.Property(m => m.Id)
              .HasDefaultValueSql("gen_random_uuid()");

        entity.Property(m => m.FullName)
              .IsRequired()
              .HasMaxLength(100);

        entity.Property(m => m.Email)
              .IsRequired()
              .HasMaxLength(255);

        entity.Property(m => m.Subject)
              .IsRequired()
              .HasMaxLength(255);

        entity.Property(m => m.Message)
              .IsRequired()
              .HasMaxLength(5000);

        entity.Property(m => m.CreatedAt)
              .HasDefaultValueSql("NOW()");

        entity.Property(m => m.IsRead)
              .HasDefaultValue(false);

        entity.HasIndex(m => m.CreatedAt);
    }
}
