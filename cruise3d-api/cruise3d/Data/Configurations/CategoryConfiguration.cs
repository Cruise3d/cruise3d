// Data/Configurations/CategoryConfiguration.cs

using cruise3d.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace cruise3d.API.Data.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> entity)
    {
        entity.ToTable("categories");

        entity.HasKey(c => c.Id);

        entity.Property(c => c.Id)
              .HasDefaultValueSql("gen_random_uuid()");

        entity.Property(c => c.Name)
              .IsRequired()
              .HasMaxLength(100);

        entity.HasIndex(c => c.Name)
              .IsUnique();

        entity.Property(c => c.Slug)
              .IsRequired()
              .HasMaxLength(100);

        entity.HasIndex(c => c.Slug)
              .IsUnique();

        entity.Property(c => c.IconUrl)
              .HasMaxLength(500);

        entity.Property(c => c.SortOrder)
              .HasDefaultValue(0);
    }
}