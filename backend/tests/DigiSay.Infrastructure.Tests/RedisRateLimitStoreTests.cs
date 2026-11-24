using DigiSay.Infrastructure.RateLimiting;
using StackExchange.Redis;
using Xunit;

namespace DigiSay.Infrastructure.Tests;

public sealed class RedisRateLimitStoreTests
{
    [Fact]
    public async Task Redis_lua_store_enforces_concurrent_limit_reports_ttl_and_expires_key()
    {
        var connectionString = Environment.GetEnvironmentVariable("TEST_REDIS_CONNECTION_STRING");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return;
        }

        using var connection = await ConnectionMultiplexer.ConnectAsync(connectionString);
        var store = new RedisRateLimitStore(connection);
        var key = $"digisay:test:rate:{Guid.NewGuid():N}";
        var window = TimeSpan.FromSeconds(2);

        var results = await Task.WhenAll(Enumerable.Range(0, 40).Select(_ =>
            store.TryAcquireAsync(key, 7, window, CancellationToken.None)));

        Assert.Equal(7, results.Count(result => result.Allowed));
        var denied = results.Where(result => !result.Allowed).ToArray();
        Assert.NotEmpty(denied);
        Assert.All(denied, result => Assert.InRange(result.RetryAfter, TimeSpan.FromMilliseconds(1), window));

        await Task.Delay(window + TimeSpan.FromMilliseconds(250));

        var afterExpiry = await store.TryAcquireAsync(key, 7, window, CancellationToken.None);
        Assert.True(afterExpiry.Allowed);
    }
}
