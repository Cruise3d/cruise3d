using System;
using System.IO;
using System.Text.Json;
using Npgsql;

namespace AdminSeeder;

internal static class Program
{
    private static int Main(string[] args)
    {
        try
        {
            var repoRoot = Directory.GetCurrentDirectory();

            // Respect ASPNETCORE_ENVIRONMENT when reading appsettings
            var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
            var appSettingsPath = Path.Combine(repoRoot, $"appsettings.{env}.json");
            if (!File.Exists(appSettingsPath))
                appSettingsPath = Path.Combine(repoRoot, "appsettings.json");

            string? connectionString = null;
            if (File.Exists(appSettingsPath))
            {
                using var fs = File.OpenRead(appSettingsPath);
                using var doc = JsonDocument.Parse(fs);
                if (doc.RootElement.TryGetProperty("ConnectionStrings", out var cs)
                    && cs.TryGetProperty("DefaultConnection", out var dc))
                {
                    connectionString = dc.GetString();
                }
            }

            // allow override: first arg can be connection string, second arg password
            string password = "Admin@1234!";
            if (args.Length >= 1 && args[0].StartsWith("Host=", StringComparison.OrdinalIgnoreCase))
                connectionString = args[0];
            else if (args.Length >= 1)
                password = args[0];
            if (args.Length >= 2)
                password = args[1];

            if (string.IsNullOrWhiteSpace(connectionString))
            {
                Console.Error.WriteLine("Connection string not found. Provide appsettings.Development.json with ConnectionStrings:DefaultConnection or pass the connection string as the first argument.");
                return 2;
            }

            Console.WriteLine("Using connection: {0}", connectionString.Replace("Password=", "Password=****"));

            var sql = @"INSERT INTO users (id, name, email, password_hash, role, is_active, created_at, updated_at)
VALUES (@id, @name, @email, crypt(@password, gen_salt('bf', 12)), @role, TRUE, NOW(), NOW())
ON CONFLICT (email) DO UPDATE
  SET password_hash = EXCLUDED.password_hash,
      role = EXCLUDED.role,
      is_active = EXCLUDED.is_active,
      updated_at = NOW();";

            using var conn = new NpgsqlConnection(connectionString);
            conn.Open();
            using var cmd = new NpgsqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("id", Guid.Parse("00000000-0000-0000-0000-000000000001"));
            cmd.Parameters.AddWithValue("name", "Admin");
            cmd.Parameters.AddWithValue("email", "admin@cruise3d.com");
            cmd.Parameters.AddWithValue("password", password);
            cmd.Parameters.AddWithValue("role", "admin");
            var affected = cmd.ExecuteNonQuery();

            Console.WriteLine($"Admin upsert completed. Rows affected: {affected}");
            return 0;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine("Error: " + ex.Message);
            return 1;
        }
    }
}
