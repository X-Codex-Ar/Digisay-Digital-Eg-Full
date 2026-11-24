using DigiSay.Application.Common.RateLimiting;
using DigiSay.Infrastructure.RateLimiting;
using Xunit;

namespace DigiSay.Infrastructure.Tests;

public sealed class InMemoryRateLimitStoreTests
{
    [Fact]
    public async Task Separate_consumers_observe_the_same_counter_when_using_the_shared_store()
    {
        IRateLimitStore firstInstance = new InMemoryRateLimitStore();
        var secondInstance = firstInstance;

        Assert.True((await firstInstance.TryAcquireAsync("key", 1, TimeSpan.FromMinutes(1), default)).Allowed);
        var denied = await secondInstance.TryAcquireAsync("key", 1, TimeSpan.FromMinutes(1), default);

        Assert.False(denied.Allowed);
        Assert.True(denied.RetryAfter > TimeSpan.Zero);
    }

    [Fact]
    public async Task Concurrent_requests_never_exceed_the_configured_limit()
    {
        var store = new InMemoryRateLimitStore();
        var results = await Task.WhenAll(Enumerable.Range(0, 40).Select(_ =>
            store.TryAcquireAsync("concurrent", 7, TimeSpan.FromMinutes(1), default)));

        Assert.Equal(7, results.Count(result => result.Allowed));
    }
}
