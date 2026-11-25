namespace DigiSay.Infrastructure.Persistence;

/// <summary>Durable versioned integration event stored in the SQL Server transaction.</summary>
public sealed class OutboxMessage
{
    private OutboxMessage() { }

    public Guid Id { get; private set; }
    public string EventType { get; private set; } = string.Empty;
    public string Payload { get; private set; } = string.Empty;
    public DateTimeOffset OccurredAtUtc { get; private set; }
    public int AttemptCount { get; private set; }
    public DateTimeOffset NextAttemptAtUtc { get; private set; }
    public Guid? LeaseId { get; private set; }
    public DateTimeOffset? LeaseExpiresAtUtc { get; private set; }
    public DateTimeOffset? ProcessedAtUtc { get; private set; }
    public DateTimeOffset? DeadLetteredAtUtc { get; private set; }
    public string? LastError { get; private set; }

    public static OutboxMessage Create(string eventType, string payload, DateTimeOffset occurredAtUtc)
    {
        if (string.IsNullOrWhiteSpace(eventType) || eventType.Length > 160)
            throw new ArgumentException("A bounded event type is required.", nameof(eventType));
        if (string.IsNullOrWhiteSpace(payload) || payload.Length > 16_000)
            throw new ArgumentException("A bounded event payload is required.", nameof(payload));

        return new OutboxMessage
        {
            Id = Guid.NewGuid(),
            EventType = eventType,
            Payload = payload,
            OccurredAtUtc = occurredAtUtc,
            NextAttemptAtUtc = occurredAtUtc,
        };
    }

    internal void Lease(Guid leaseId, DateTimeOffset expiresAtUtc)
    {
        LeaseId = leaseId;
        LeaseExpiresAtUtc = expiresAtUtc;
    }

    internal void MarkProcessed(DateTimeOffset now)
    {
        ProcessedAtUtc = now;
        LeaseId = null;
        LeaseExpiresAtUtc = null;
        LastError = null;
    }

    internal void MarkFailed(DateTimeOffset now, string errorType)
    {
        AttemptCount++;
        LeaseId = null;
        LeaseExpiresAtUtc = null;
        LastError = errorType.Length <= 200 ? errorType : errorType[..200];
        if (AttemptCount >= 10)
        {
            DeadLetteredAtUtc = now;
            return;
        }

        var delaySeconds = Math.Min(3600, 5 * Math.Pow(2, AttemptCount - 1));
        NextAttemptAtUtc = now.AddSeconds(delaySeconds);
    }
}
