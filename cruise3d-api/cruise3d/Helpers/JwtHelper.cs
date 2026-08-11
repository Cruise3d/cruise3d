using System.Security.Claims;

namespace cruise3d.API.Helpers;

public static class JwtHelper
{
    // Gets the logged-in user's ID from JWT claims
    public static Guid GetUserId(ClaimsPrincipal user)
    {
        var claim = user.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new Exception("Unauthorized.");
        return Guid.Parse(claim);
    }

    // Gets the logged-in user's role from JWT claims
    public static string GetRole(ClaimsPrincipal user)
        => user.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
}

