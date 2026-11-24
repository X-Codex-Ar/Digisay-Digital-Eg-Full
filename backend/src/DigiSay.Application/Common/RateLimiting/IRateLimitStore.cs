namespace DigiSay.Application.Common.RateLimiting;

public interface IRateLimitStore
{
    Task<RateLimitDecision> TryAcquireAsync(
        string key,
        int permitLimit,
        TimeSpan window,
        CancellationToken cancellationToken);
}

public sealed record RateLimitDecision(bool Allowed, TimeSpan RetryAfter);
