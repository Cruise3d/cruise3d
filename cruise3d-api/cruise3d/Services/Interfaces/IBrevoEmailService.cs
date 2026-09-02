namespace cruise3d.API.Services.Interfaces;

public interface IBrevoEmailService
{
    Task SendVerificationEmailAsync(
        string toEmail,
        string toName,
        string verificationLink,
        DateTime expiresAt,
        CancellationToken cancellationToken = default);
}
