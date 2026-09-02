namespace cruise3d.API.Models.Settings;

public class EmailVerificationOptions
{
    public int TokenLifetimeMinutes { get; set; } = 1440;
    public string VerificationPath { get; set; } = "/verify-email";
}
