using cruise3d.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace cruise3d.API.Data.Configurations;

public class NotificationTokenConfiguration : IEntityTypeConfiguration<NotificationToken>
{
    public void Configure(EntityTypeBuilder<NotificationToken> builder)
    {
        builder.ToTable("notification_tokens");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.UserId).HasColumnName("user_id");
        builder.Property(x => x.Token).HasColumnName("token").IsRequired();
        builder.Property(x => x.Platform).HasColumnName("platform").HasDefaultValue("web");
        builder.Property(x => x.UserAgent).HasColumnName("user_agent");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.LastSeenAt).HasColumnName("last_seen_at");
        builder.Property(x => x.Muted).HasColumnName("muted").HasDefaultValue(false);

        builder.HasIndex(x => x.Token).IsUnique().HasDatabaseName("IX_notification_tokens_token");

        builder.HasOne(x => x.User)
               .WithMany()
               .HasForeignKey(x => x.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
