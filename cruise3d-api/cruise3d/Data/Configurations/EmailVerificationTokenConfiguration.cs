using cruise3d.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace cruise3d.API.Data.Configurations;

public class EmailVerificationTokenConfiguration : IEntityTypeConfiguration<EmailVerificationToken>
{
    public void Configure(EntityTypeBuilder<EmailVerificationToken> builder)
    {
        builder.ToTable(tb => tb.HasCheckConstraint(
            "chk_email_verification_tokens_expires_at",
            "expires_at > created_at"
        ));
        builder.Metadata.SetTableName("email_verification_tokens");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
               .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(x => x.UserId)
               .IsRequired();

        builder.Property(x => x.TokenHash)
               .IsRequired()
               .HasMaxLength(255);

        builder.Property(x => x.CreatedAt)
               .HasDefaultValueSql("NOW()");

        builder.Property(x => x.ExpiresAt)
               .IsRequired();

        builder.Property(x => x.UsedAt);

        builder.Property(x => x.RevokedAt);

        builder.HasIndex(x => x.TokenHash)
               .IsUnique()
               .HasDatabaseName("i_x_email_verification_tokens_token_hash");

        builder.HasIndex(x => x.UserId)
               .HasDatabaseName("i_x_email_verification_tokens_user_id");

        builder.HasOne(x => x.User)
               .WithMany(u => u.EmailVerificationTokens)
               .HasForeignKey(x => x.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
