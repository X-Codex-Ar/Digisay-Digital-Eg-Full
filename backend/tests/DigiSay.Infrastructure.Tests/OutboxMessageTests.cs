using DigiSay.Infrastructure.Persistence;
using Xunit;

namespace DigiSay.Infrastructure.Tests;

public sealed class OutboxMessageTests
{
    [Fact]
    public void Failed_delivery_uses_exponential_backoff_and_dead_letters_after_ten_attempts()
    {
        var now = DateTimeOffset.Parse("2026-11-25T10:00:00Z");
        var message = OutboxMessage.Create("crm.lead.created.v1", "{\"id\":\"test\"}", now);

        message.Lease(Guid.NewGuid(), now.AddMinutes(5));
        message.MarkFailed(now, "IOException");
        Assert.Equal(1, message.AttemptCount);
        Assert.Equal(now.AddSeconds(5), message.NextAttemptAtUtc);
        Assert.Null(message.DeadLetteredAtUtc);
        Assert.Equal("IOException", message.LastError);

        for (var attempt = 2; attempt <= 10; attempt++)
        {
            message.Lease(Guid.NewGuid(), now.AddMinutes(5));
            message.MarkFailed(now, "IOException");
        }

        Assert.Equal(10, message.AttemptCount);
        Assert.Equal(now, message.DeadLetteredAtUtc);
        Assert.Null(message.LeaseId);
        Assert.Null(message.LeaseExpiresAtUtc);
    }
}
