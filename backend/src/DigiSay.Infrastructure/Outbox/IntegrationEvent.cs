namespace DigiSay.Infrastructure.Outbox;

public sealed record IntegrationEvent(Guid Id, string EventType, string Payload, DateTimeOffset OccurredAtUtc);

public interface IIntegrationEventPublisher
{
    Task PublishAsync(IntegrationEvent integrationEvent, CancellationToken cancellationToken);
}

public interface IOutboxStore
{
    Task<IReadOnlyList<LeasedOutboxMessage>> ClaimBatchAsync(int batchSize, CancellationToken cancellationToken);
    Task MarkProcessedAsync(Guid id, Guid leaseId, CancellationToken cancellationToken);
    Task MarkFailedAsync(Guid id, Guid leaseId, string errorType, CancellationToken cancellationToken);
}

public sealed record LeasedOutboxMessage(
    Guid Id,
    Guid LeaseId,
    string EventType,
    string Payload,
    DateTimeOffset OccurredAtUtc);
