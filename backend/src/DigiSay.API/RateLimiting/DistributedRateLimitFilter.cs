using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using DigiSay.Application.Common.RateLimiting;
using Microsoft.Extensions.Options;

namespace DigiSay.API.RateLimiting;

internal sealed class DistributedRateLimitFilter(
    IRateLimitStore store,
    IOptions<RateLimitKeyOptions> options,
    ILogger<DistributedRateLimitFilter> logger) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var policy = context.HttpContext.GetEndpoint()?.Metadata.GetMetadata<RateLimitPolicy>();
        if (policy is null)
        {
            return await next(context);
        }

        if (policy.Name == "identity-auth")
        {
            var path = context.HttpContext.Request.Path.Value ?? string.Empty;
            var isCredentialEndpoint = path.EndsWith("/register", StringComparison.OrdinalIgnoreCase)
                || path.EndsWith("/login", StringComparison.OrdinalIgnoreCase)
                || path.EndsWith("/forgotPassword", StringComparison.OrdinalIgnoreCase)
                || path.EndsWith("/resetPassword", StringComparison.OrdinalIgnoreCase)
                || path.EndsWith("/resendConfirmationEmail", StringComparison.OrdinalIgnoreCase)
                || path.EndsWith("/bootstrap-admin", StringComparison.OrdinalIgnoreCase);
            policy = policy with
            {
                Name = isCredentialEndpoint ? "identity-auth:credentials" : $"identity-auth:{path}",
                PermitLimit = isCredentialEndpoint ? policy.PermitLimit : 60,
            };
        }

        var principal = context.HttpContext.User;
        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? principal.FindFirstValue("sub");
        var identity = principal.Identity?.IsAuthenticated == true && !string.IsNullOrWhiteSpace(userId)
            ? "user:" + userId
            : "ip:" + (context.HttpContext.Connection.RemoteIpAddress?.MapToIPv6().ToString() ?? "unknown");
        var keyMaterial = Encoding.UTF8.GetBytes(policy.Name + ":" + identity);
        var keyHash = Convert.ToHexString(HMACSHA256.HashData(
            Encoding.UTF8.GetBytes(options.Value.KeyHashSecret), keyMaterial));
        var storeKey = $"digisay:rate:{policy.Name}:{keyHash}";

        RateLimitDecision decision;
        try
        {
            decision = await store.TryAcquireAsync(
                storeKey, policy.PermitLimit, policy.Window, context.HttpContext.RequestAborted);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            logger.LogWarning("Distributed rate-limit storage is unavailable; rejecting the request.");
            context.HttpContext.Response.Headers.RetryAfter = "5";
            return Results.Problem(
                statusCode: StatusCodes.Status503ServiceUnavailable,
                title: "Request protection is temporarily unavailable.");
        }

        if (decision.Allowed)
        {
            return await next(context);
        }

        var retrySeconds = Math.Max(1, (long)Math.Ceiling(decision.RetryAfter.TotalSeconds));
        context.HttpContext.Response.Headers.RetryAfter = retrySeconds.ToString(System.Globalization.CultureInfo.InvariantCulture);
        return Results.Problem(
            statusCode: StatusCodes.Status429TooManyRequests,
            title: "Too many requests.");
    }
}
