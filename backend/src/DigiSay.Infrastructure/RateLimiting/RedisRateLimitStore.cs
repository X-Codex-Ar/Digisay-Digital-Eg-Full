using DigiSay.Application.Common.RateLimiting;
using StackExchange.Redis;

namespace DigiSay.Infrastructure.RateLimiting;

public sealed class RedisRateLimitStore(IConnectionMultiplexer connection) : IRateLimitStore
{
    private const string ConsumeScript = """
        local count = redis.call('INCR', KEYS[1])
        if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
        local ttl = redis.call('PTTL', KEYS[1])
        if count <= tonumber(ARGV[2]) then return {1, ttl} end
        return {0, ttl}
        """;

    public async Task<RateLimitDecision> TryAcquireAsync(
        string key,
        int permitLimit,
        TimeSpan window,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        if (permitLimit <= 0 || window <= TimeSpan.Zero || window.TotalMilliseconds > int.MaxValue)
        {
            throw new ArgumentOutOfRangeException(nameof(permitLimit), "Rate limit must have a positive limit and a supported window.");
        }

        var result = (RedisResult[]?)await connection.GetDatabase().ScriptEvaluateAsync(
            ConsumeScript,
            [new RedisKey(key)],
            [(long)window.TotalMilliseconds, permitLimit]);
        if (result is not { Length: 2 })
        {
            throw new InvalidOperationException("The Redis rate-limit script returned an invalid response.");
        }

        var allowed = (long)result[0] == 1;
        var ttlMilliseconds = Math.Max(0, (long)result[1]);
        return new RateLimitDecision(allowed, TimeSpan.FromMilliseconds(ttlMilliseconds));
    }
}
