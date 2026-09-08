namespace cruise3d.Models.Settings;

public class PasswordResetOptions
{
    public int TokenLifetimeMinutes { get; set; } = 60;
    public string ResetPasswordPath { get; set; } = "/reset-password";
}
