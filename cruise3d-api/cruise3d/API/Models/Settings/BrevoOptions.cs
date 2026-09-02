namespace cruise3d.API.Models.Settings;

public class BrevoOptions
{
    public string ApiKey { get; set; } = string.Empty;
    public string SenderEmail { get; set; } = string.Empty;
    public string SenderName { get; set; } = "Cruise3D";
    public bool EnabledInDevelopment { get; set; }
}
