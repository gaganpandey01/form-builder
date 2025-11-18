using System.Net;
using System.Text.Json;

namespace FormBuilderApi.Middleware;

public class GlobalExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;

    public GlobalExceptionHandlingMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlingMiddleware> logger)
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
            _logger.LogError(ex, "An unexpected error occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new
        {
            success = false,
            message = "An error occurred while processing your request",
            errors = new List<string>()
        };

        switch (exception)
        {
            case ArgumentNullException nullEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response = new
                {
                    success = false,
                    message = "Required parameter is missing",
                    errors = new List<string> { nullEx.Message }
                };
                break;

            case ArgumentException argEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response = new
                {
                    success = false,
                    message = "Invalid argument provided",
                    errors = new List<string> { argEx.Message }
                };
                break;

            case UnauthorizedAccessException:
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                response = new
                {
                    success = false,
                    message = "Unauthorized access",
                    errors = new List<string> { "You are not authorized to perform this action" }
                };
                break;

            case KeyNotFoundException:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                response = new
                {
                    success = false,
                    message = "Resource not found",
                    errors = new List<string> { "The requested resource was not found" }
                };
                break;

            case InvalidOperationException opEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response = new
                {
                    success = false,
                    message = "Invalid operation",
                    errors = new List<string> { opEx.Message }
                };
                break;

            case NotImplementedException:
                context.Response.StatusCode = (int)HttpStatusCode.NotImplemented;
                response = new
                {
                    success = false,
                    message = "Feature not implemented",
                    errors = new List<string> { "This feature is not yet implemented" }
                };
                break;

            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response = new
                {
                    success = false,
                    message = "An unexpected error occurred",
                    errors = new List<string> { "Please try again later or contact support" }
                };
                break;
        }

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(jsonResponse);
    }
}

public static class GlobalExceptionHandlingMiddlewareExtensions
{
    public static IApplicationBuilder UseGlobalExceptionHandling(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<GlobalExceptionHandlingMiddleware>();
    }
}