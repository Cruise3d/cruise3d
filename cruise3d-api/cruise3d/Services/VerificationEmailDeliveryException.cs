namespace cruise3d.API.Services;

public class VerificationEmailDeliveryException : Exception
{
    public VerificationEmailDeliveryException()
        : base("Your account was created, but we could not send the verification email. Please request a new verification email.")
    {
    }
}
