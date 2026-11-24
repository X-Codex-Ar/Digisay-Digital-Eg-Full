using System.Collections.Concurrent;
using DigiSay.Application.Common.RateLimiting;

namespace DigiSay.Infrastructure.RateLimiting;

public sealed class InMemoryRateLimitStore : IRateLimitStore
{
    private readonly ConcurrentDictionary<string, Window> _windows = new(StringComparer.Ordinal);

    public Task<RateLimitDecision> TryAcquireAsync(
        string key,
        int permitLimit,
        TimeSpan window,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        if (permitLimit <= 0 || window <= TimeSpan.Zero)
        {
            throw new ArgumentOutOfRangeException(nameof(permitLimit), "Rate limit must have a positive limit and window.");
        }

        var now = DateTimeOffset.UtcNow;
        var state = _windows.GetOrAdd(key, _ => new Window(now, 0));
        lock (state)
        {
            if (now - state.StartedAt >= window)
            {
                state.StartedAt = now;
                state.Count = 0;
            }

            if (state.Count < permitLimit)
            {
                state.Count++;
                return Task.FromResult(new RateLimitDecision(true, TimeSpan.Zero));
            }

            return Task.FromResult(new RateLimitDecision(false,
                Max(TimeSpan.Zero, window - (now - state.StartedAt))));
        }
    }

    private static TimeSpan Max(TimeSpan left, TimeSpan right) => left > right ? left : right;

    private sealed class Window(DateTimeOffset startedAt, int count)
    {
        public DateTimeOffset StartedAt { get; set; } = startedAt;
        public int Count { get; set; } = count;
    }
}
