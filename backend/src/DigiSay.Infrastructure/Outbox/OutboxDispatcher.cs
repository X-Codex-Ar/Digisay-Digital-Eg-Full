using DigiSay.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace DigiSay.Infrastructure.Outbox;

internal sealed class OutboxDispatcher(
    IServiceScopeFactory scopeFactory,
    ILogger<OutboxDispatcher> logger) : BackgroundService
{
    private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(5);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var dispatched = await DispatchBatchAsync(stoppingToken);
            if (dispatched == 0)
            {
                await Task.Delay(PollInterval, stoppingToken);
            }
        }
    }

    private async Task<int> DispatchBatchAsync(CancellationToken cancellationToken)
    {
        try
        {
            await using var scope = scopeFactory.CreateAsyncScope();
            var store = scope.ServiceProvider.GetRequiredService<IOutboxStore>();
            var publisher = scope.ServiceProvider.GetRequiredService<IIntegrationEventPublisher>();
            var messages = await store.ClaimBatchAsync(20, cancellationToken);
            foreach (var message in messages)
            {
                try
                {
                    await publisher.PublishAsync(new IntegrationEvent(
                        message.Id, message.EventType, message.Payload, message.OccurredAtUtc), cancellationToken);
                    await store.MarkProcessedAsync(message.Id, message.LeaseId, cancellationToken);
                }
                catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
                {
                    throw;
                }
                catch (Exception exception)
                {
                    await store.MarkFailedAsync(
                        message.Id, message.LeaseId, exception.GetType().Name, cancellationToken);
                    logger.LogWarning(
                        "Outbox delivery failed for event {EventId} of type {EventType}; retry state was recorded.",
                        message.Id, message.EventType);
                }
            }

            return messages.Count;
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception exception)
        {
            logger.LogError("Outbox dispatch batch failed ({FailureType}); pending rows remain available for retry.",
                exception.GetType().Name);
            return 0;
        }
    }
}
