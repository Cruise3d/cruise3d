using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.AspNetCore.Mvc;

namespace cruise3d.API.Controllers;

[ApiController]
[Route("api/upload")]
[Authorize(Roles = "admin")]
public class UploadController : ControllerBase
{
    private readonly IConfiguration _config;

    public UploadController(IConfiguration config)
    {
        _config = config;
    }

    // GET api/upload/signature
    // Admin only - returns a Cloudinary signature payload for direct browser uploads.
    [HttpGet("signature")]
    public IActionResult GetSignature(
        [FromQuery] string folder = "cruise3d/products",
        [FromQuery] string source = "uw",
        [FromQuery] string? timestamp = null,
        [FromQuery] string? data = null)
    {
        var apiKey = _config["Cloudinary:ApiKey"];
        var apiSecret = _config["Cloudinary:ApiSecret"];
        var cloudName = _config["Cloudinary:CloudName"];

        if (string.IsNullOrWhiteSpace(apiKey) ||
            string.IsNullOrWhiteSpace(apiSecret) ||
            string.IsNullOrWhiteSpace(cloudName))
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = "Cloudinary configuration is missing."
            });
        }

        var parameters = new SortedDictionary<string, string>(StringComparer.Ordinal);

        if (!string.IsNullOrWhiteSpace(data))
        {
            foreach (var pair in QueryHelpers.ParseQuery(data))
            {
                var value = pair.Value.ToString();
                if (!string.IsNullOrWhiteSpace(value))
                {
                    parameters[pair.Key] = value;
                }
            }
        }
        else
        {
            foreach (var queryParam in Request.Query)
            {
                if (string.Equals(queryParam.Key, "data", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                var value = queryParam.Value.ToString();
                if (!string.IsNullOrWhiteSpace(value))
                {
                    parameters[queryParam.Key] = value;
                }
            }
        }

        if (!parameters.ContainsKey("folder"))
        {
            parameters["folder"] = folder;
        }

        if (!parameters.ContainsKey("source"))
        {
            parameters["source"] = source;
        }

        if (!parameters.ContainsKey("timestamp"))
        {
            parameters["timestamp"] = string.IsNullOrWhiteSpace(timestamp)
                ? DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString()
                : timestamp;
        }

        var paramString = string.Join("&", parameters.Select(p => $"{p.Key}={p.Value}"));
        var signaturePayload = paramString + apiSecret;

        using var sha1 = SHA1.Create();
        var bytes = Encoding.UTF8.GetBytes(signaturePayload);
        var hash = sha1.ComputeHash(bytes);
        var signature = BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();

        return Ok(new
        {
            cloudName,
            apiKey,
            timestamp = parameters["timestamp"],
            signature,
            folder = parameters["folder"],
            source = parameters["source"]
        });
    }
}
