using System.Text;
using cruise3d.API.Data;
using cruise3d.API.Middleware;
using cruise3d.API.Repositories;
using cruise3d.API.Repositories.Interfaces;
using cruise3d.API.Services;
using cruise3d.API.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ─── DATABASE ─────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration
        .GetConnectionString("DefaultConnection")));

// ─── JWT AUTHENTICATION ───────────────────────────────────────────────────────
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();

// ─── CORS ─────────────────────────────────────────────────────────────────────
builder.Services.AddCors(opt => opt.AddPolicy("AllowFrontend", p =>
    p.AllowAnyOrigin()
     .AllowAnyHeader()
     .AllowAnyMethod()));

// ─── REPOSITORIES ─────────────────────────────────────────────────────────────
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductImageRepository, ProductImageRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<IAddressRepository, AddressRepository>();

// ─── SERVICES ─────────────────────────────────────────────────────────────────
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IReviewService, ReviewService>();

// Payments
builder.Services.AddScoped<cruise3d.API.Repositories.Interfaces.IPaymentRepository, cruise3d.API.Repositories.PaymentRepository>();
builder.Services.AddScoped<cruise3d.API.Services.Interfaces.IPaymentService, cruise3d.API.Services.PaymentService>();

// Firebase Admin SDK init — add before builder.Build()
var fbPath = builder.Configuration["Firebase:CredentialsPath"]
    ?? builder.Configuration["FIREBASE_CREDENTIALS_PATH"]
    ?? "secrets/firebase-adminsdk.json";

string? resolvedFbPath = null;
var candidatePaths = new[]
{
    fbPath,
    Path.Combine(builder.Environment.ContentRootPath, fbPath),
    Path.Combine(Directory.GetCurrentDirectory(), fbPath),
    Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", "..", fbPath)),
    Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", fbPath)),
    Path.Combine(AppContext.BaseDirectory, fbPath),
    Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", "..", "secrets", "firebase-adminsdk.json")),
    Path.Combine(builder.Environment.ContentRootPath, "secrets", "firebase-adminsdk.json"),
    "/app/secrets/firebase-adminsdk.json"
};

foreach (var candidate in candidatePaths)
{
    if (!string.IsNullOrWhiteSpace(candidate) && File.Exists(candidate))
    {
        resolvedFbPath = candidate;
        break;
    }
}

// Fallback: auto-discover any "*firebase-adminsdk*.json" file inside any
// "secrets/" directory near the app. This lets operators drop the file with
// whatever name Firebase generated (e.g. "<project>-firebase-adminsdk-<hash>.json")
// and have it picked up without renaming or setting env vars.
if (string.IsNullOrEmpty(resolvedFbPath))
{
    var secretsDirs = new[]
    {
        Path.Combine(builder.Environment.ContentRootPath, "secrets"),
        Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", "secrets")),
        Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", "..", "secrets")),
        "/app/secrets"
    };

    foreach (var dir in secretsDirs)
    {
        if (!Directory.Exists(dir)) continue;
        var found = Directory.EnumerateFiles(dir, "*firebase-adminsdk*.json", SearchOption.TopDirectoryOnly)
                              .OrderBy(f => f, StringComparer.OrdinalIgnoreCase)
                              .FirstOrDefault();
        if (!string.IsNullOrEmpty(found))
        {
            resolvedFbPath = found;
            break;
        }
    }
}

if (!string.IsNullOrEmpty(resolvedFbPath))
{
    try
    {
        FirebaseAdmin.FirebaseApp.Create(new FirebaseAdmin.AppOptions
        {
            Credential = Google.Apis.Auth.OAuth2.GoogleCredential.FromFile(resolvedFbPath)
        });
        Console.WriteLine($"✓ Firebase Admin SDK initialized successfully from: {resolvedFbPath}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️  Failed to initialize Firebase Admin SDK: {ex.Message}");
    }
}
else
{
    Console.WriteLine("⚠️  Firebase credentials not found (checked secrets/firebase-adminsdk.json and any *firebase-adminsdk*.json in nearby secrets/ dirs) — push notifications disabled.");
}

// DI registrations — add alongside existing services
builder.Services.AddScoped<INotificationTokenRepository, NotificationTokenRepository>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddHostedService<NotificationTokenSweeper>();

// Bind Razorpay options from configuration
builder.Services.Configure<cruise3d.API.Models.Settings.RazorpayOptions>(
    builder.Configuration.GetSection("Razorpay"));

// ─── CONTROLLERS + SWAGGER ────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Apply EF Core migrations automatically on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var db = services.GetRequiredService<AppDbContext>();
        // Ensure migrations are applied on startup. If the database was created earlier
        // (for example by EnsureCreated) the __EFMigrationsHistory table may be missing
        // while the schema exists. In that case create the migrations history table and
        // mark existing migrations as applied so Migrate() will only apply pending ones.
        // This avoids trying to create tables that already exist.
        var conn = db.Database.GetDbConnection();
        try
        {
            conn.Open();

            using var cmd = conn.CreateCommand();
            // Create the migrations history table if it doesn't exist
            cmd.CommandText =
                "CREATE TABLE IF NOT EXISTS \"__EFMigrationsHistory\" (\"MigrationId\" character varying(150) NOT NULL, \"ProductVersion\" character varying(32) NOT NULL, CONSTRAINT \"PK___EFMigrationsHistory\" PRIMARY KEY (\"MigrationId\"));";
            cmd.ExecuteNonQuery();

            // Check if the history table already has entries
            cmd.CommandText = "SELECT COUNT(*) FROM \"__EFMigrationsHistory\";";
            var count = Convert.ToInt32(cmd.ExecuteScalar() ?? 0);

            if (count == 0)
            {
                // If history is empty but core tables already exist, seed history from available migrations
                cmd.CommandText = "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories');";
                var hasCategories = Convert.ToBoolean(cmd.ExecuteScalar() ?? false);

                if (hasCategories)
                {
                    // Use GetRequiredService to ensure the migrations assembly is available
                    var migrationsAssembly = services.GetRequiredService<Microsoft.EntityFrameworkCore.Migrations.IMigrationsAssembly>();
                    if (migrationsAssembly.Migrations != null)
                    {
                        // Insert all known migrations as applied so Migrate() will skip creating already-existing objects.
                        foreach (var migrationId in migrationsAssembly.Migrations.Keys)
                        {
                            // Use parameterized insert to avoid issues with migration id quoting
                            cmd.CommandText = "INSERT INTO \"__EFMigrationsHistory\" (\"MigrationId\", \"ProductVersion\") VALUES (@id, @pv) ON CONFLICT (\"MigrationId\") DO NOTHING;";
                            var p1 = cmd.CreateParameter(); p1.ParameterName = "@id"; p1.Value = migrationId; cmd.Parameters.Clear(); cmd.Parameters.Add(p1);
                            var p2 = cmd.CreateParameter(); p2.ParameterName = "@pv"; p2.Value = "10.0.10"; cmd.Parameters.Add(p2);
                            cmd.ExecuteNonQuery();
                        }
                    }
                }
            }
        }
        finally
        {
            try { conn.Close(); } catch { }
        }

        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while migrating or initializing the database.");
        throw;
    }
}

// ─── MIDDLEWARE PIPELINE ──────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Cruise3D API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowFrontend");
app.UseMiddleware<ExceptionMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
