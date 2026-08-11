using cruise3d.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using System.Text;

namespace cruise3d.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Address> Addresses => Set<Address>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<ProductColor> ProductColors => Set<ProductColor>();
        public DbSet<ProductImage> ProductImages => Set<ProductImage>();
        public DbSet<ProductSpec> ProductSpecs => Set<ProductSpec>();
        public DbSet<Cart> Carts => Set<Cart>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<Testimonial> Testimonials => Set<Testimonial>();
        public DbSet<NewsletterSubscriber> NewsletterSubscribers => Set<NewsletterSubscriber>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // This one line scans the current assembly and automatically
            // finds and applies ALL IEntityTypeConfiguration classes
            // No need to call each configuration file manually
            modelBuilder.ApplyConfigurationsFromAssembly(
                typeof(AppDbContext).Assembly
            );
            // Ensure EF Core maps CLR names to snake_case column names in Postgres
            // This aligns EF queries (user_id) with existing DB column naming.
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                var tableName = entity.GetTableName();
                var schema = entity.GetSchema();
                if (!string.IsNullOrEmpty(tableName))
                {
                    entity.SetTableName(ToSnakeCase(tableName));
                }
                if (!string.IsNullOrEmpty(schema))
                {
                    entity.SetSchema(ToSnakeCase(schema));
                }

                foreach (var property in entity.GetProperties())
                {
                    var columnName = property.GetColumnName(StoreObjectIdentifier.Table(tableName, entity.GetSchema()));
                    if (!string.IsNullOrEmpty(columnName))
                        property.SetColumnName(ToSnakeCase(columnName));
                }

                foreach (var key in entity.GetKeys())
                {
                    key.SetName(ToSnakeCase(key.GetName()));
                }

                foreach (var fk in entity.GetForeignKeys())
                {
                    fk.SetConstraintName(ToSnakeCase(fk.GetConstraintName()));
                }

                foreach (var index in entity.GetIndexes())
                {
                    index.SetDatabaseName(ToSnakeCase(index.GetDatabaseName()));
                }
            }
        }

        private static string ToSnakeCase(string input)
        {
            if (string.IsNullOrEmpty(input)) return input;
            var sb = new StringBuilder();
            for (int i = 0; i < input.Length; i++)
            {
                var c = input[i];
                if (char.IsUpper(c))
                {
                    if (i > 0 && sb[sb.Length - 1] != '_')
                        sb.Append('_');
                    sb.Append(char.ToLowerInvariant(c));
                }
                else
                {
                    sb.Append(c);
                }
            }
            return sb.ToString();
        }
    }
}
