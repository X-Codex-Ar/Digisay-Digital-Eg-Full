using DigiSay.Infrastructure.Outbox;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Xunit;

namespace DigiSay.Infrastructure.Tests;

public sealed class OutboxDispatcherTests
{
    [Fact]
    public async Task Publisher_failure_is_sent_to_the_retry_store()
    {
        var store = new RecordingOutboxStore();
        using var services = new ServiceCollection()
            .AddLogging()
            .AddSingleton<IOutboxStore>(store)
            .AddSingleton<IIntegrationEventPublisher, FailingPublisher>()
            .BuildServiceProvider();
        var dispatcher = new OutboxDispatcher(
            services.GetRequiredService<IServiceScopeFactory>(),
            services.GetRequiredService<ILogger<OutboxDispatcher>>());

        await dispatcher.StartAsync(CancellationToken.None);
        var failed = await store.FailureRecorded.Task.WaitAsync(TimeSpan.FromSeconds(5));
        await dispatcher.StopAsync(CancellationToken.None);

        Assert.Equal(store.MessageId, failed.Id);
        Assert.Equal(store.LeaseId, failed.LeaseId);
        Assert.Equal(nameof(IOException), failed.ErrorType);
    }

    private sealed class FailingPublisher : IIntegrationEventPublisher
    {
        public Task PublishAsync(IntegrationEvent integrationEvent, CancellationToken cancellationToken) =>
            throw new IOException("simulated delivery failure");
    }

    private sealed class RecordingOutboxStore : IOutboxStore
    {
        public Guid MessageId { get; } = Guid.NewGuid();
        public Guid LeaseId { get; } = Guid.NewGuid();
        public TaskCompletionSource<Failure> FailureRecorded { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);
        private int _claimed;

        public Task<IReadOnlyList<LeasedOutboxMessage>> ClaimBatchAsync(int batchSize, CancellationToken cancellationToken)
        {
            IReadOnlyList<LeasedOutboxMessage> result = Interlocked.Exchange(ref _claimed, 1) == 0
                ? [new LeasedOutboxMessage(MessageId, LeaseId, "crm.lead.created.v1", "{}", DateTimeOffset.UtcNow)]
                : [];
            return Task.FromResult(result);
        }

        public Task MarkProcessedAsync(Guid id, Guid leaseId, CancellationToken cancellationToken) =>
            throw new InvalidOperationException("Failed deliveries must not be acknowledged.");

        public Task MarkFailedAsync(Guid id, Guid leaseId, string errorType, CancellationToken cancellationToken)
        {
            FailureRecorded.TrySetResult(new Failure(id, leaseId, errorType));
            return Task.CompletedTask;
        }
    }

    private sealed record Failure(Guid Id, Guid LeaseId, string ErrorType);
}
