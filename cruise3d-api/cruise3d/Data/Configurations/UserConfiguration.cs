// Data/Configurations/UserConfiguration.cs

using cruise3d.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace cruise3d.API.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> entity)
    {
        // configure check constraint via the ToTable(Action<RelationalEntityTypeBuilder>) API
        entity.ToTable(tb => tb.HasCheckConstraint(
            "chk_users_role",
            "role IN ('admin', 'customer')"
        ));
        // ensure table name is set to 'users'
        entity.Metadata.SetTableName("users");

        entity.HasKey(u => u.Id);

        entity.Property(u => u.Id)
              .HasDefaultValueSql("gen_random_uuid()")
              .HasColumnName("id");

        entity.Property(u => u.Name)
              .IsRequired()
              .HasMaxLength(100)
              .HasColumnName("name");

        entity.Property(u => u.Email)
              .IsRequired()
              .HasMaxLength(255)
              .HasColumnName("email");

        entity.HasIndex(u => u.Email)
              .IsUnique();

        entity.Property(u => u.PasswordHash)
              .IsRequired()
              .HasMaxLength(255)
              .HasColumnName("password_hash");

        entity.Property(u => u.Role)
              .IsRequired()
              .HasMaxLength(20)
              .HasDefaultValue("customer")
              .HasColumnName("role");

        entity.Property(u => u.Phone)
              .HasMaxLength(20)
              .HasColumnName("phone");

        entity.Property(u => u.IsActive)
              .HasDefaultValue(true)
              .HasColumnName("is_active");

        entity.Property(u => u.CreatedAt)
              .HasDefaultValueSql("NOW()")
              .HasColumnName("created_at");

        entity.Property(u => u.UpdatedAt)
              .HasDefaultValueSql("NOW()")
              .HasColumnName("updated_at");

        // Seed admin user
        entity.HasData(new User
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
            Name = "Admin",
            Email = "admin@cruise3d.com",
            // store a precomputed bcrypt hash to avoid a build-time dependency on the BCrypt library
            PasswordHash = "$2a$12$abcdefghijklmnopqrstuvABCDEFGHIJKLMNOPQRSTUV012345",
            Role = "admin",
            IsActive = true,
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });
    }
}