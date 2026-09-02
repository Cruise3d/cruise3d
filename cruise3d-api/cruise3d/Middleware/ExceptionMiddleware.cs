using System.Net;
using System.Text.Json;
using cruise3d.API.Models.DTOs.Common;
using cruise3d.API.Services;

namespace cruise3d.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next,
        ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

        private static async Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            context.Response.ContentType = "application/json";

            // Map known client errors to appropriate status codes. All other exceptions are treated as 500.
            var statusCode = ex.Message switch
            {
                _ when ex is VerificationEmailDeliveryException => (int)HttpStatusCode.ServiceUnavailable,
                var m when m.Contains("not found", StringComparison.OrdinalIgnoreCase) => (int)HttpStatusCode.NotFound,
                var m when m.Contains("unauthorized", StringComparison.OrdinalIgnoreCase) => (int)HttpStatusCode.Unauthorized,
                var m when m.Contains("already exists", StringComparison.OrdinalIgnoreCase) => (int)HttpStatusCode.Conflict,
                var m when m.Contains("already registered", StringComparison.OrdinalIgnoreCase) => (int)HttpStatusCode.Conflict,
                var m when m.Contains("invalid", StringComparison.OrdinalIgnoreCase) => (int)HttpStatusCode.BadRequest,
                var m when m.Contains("amount mismatch", StringComparison.OrdinalIgnoreCase) => (int)HttpStatusCode.BadRequest,
                _ => (int)HttpStatusCode.InternalServerError
            };

            // Do not leak internal exception messages for server errors
            var message = statusCode == (int)HttpStatusCode.InternalServerError
                ? "An unexpected error occurred."
                : ex.Message;

            context.Response.StatusCode = statusCode;

            var response = ApiResponse<string>.Fail(message);

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
        }
}

