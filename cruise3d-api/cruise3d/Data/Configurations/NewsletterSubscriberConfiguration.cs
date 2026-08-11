// Data/Configurations/NewsletterSubscriberConfiguration.cs
using cruise3d.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace cruise3d.API.Data.Configurations;

public class NewsletterSubscriberConfiguration : IEntityTypeConfiguration<NewsletterSubscriber>
{
    public void Configure(EntityTypeBuilder<NewsletterSubscriber> entity)
    {
        entity.ToTable("newsletter_subscribers");

        entity.HasKey(n => n.Id);

        entity.Property(n => n.Id)
              .HasDefaultValueSql("gen_random_uuid()");

        entity.Property(n => n.Email)
              .IsRequired()
              .HasMaxLength(255);

        entity.HasIndex(n => n.Email)
              .IsUnique();

        entity.Property(n => n.IsActive)
              .HasDefaultValue(true);

        entity.Property(n => n.SubscribedAt)
              .HasDefaultValueSql("NOW()");
    }
}