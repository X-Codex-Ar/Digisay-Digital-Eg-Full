using DigiSay.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DigiSay.Infrastructure.Outbox;

internal sealed class SqlOutboxStore(DigiSayDbContext dbContext) : IOutboxStore
{
    private static readonly TimeSpan LeaseDuration = TimeSpan.FromMinutes(5);

    public async Task<IReadOnlyList<LeasedOutboxMessage>> ClaimBatchAsync(
        int batchSize,
        CancellationToken cancellationToken)
    {
        if (batchSize is < 1 or > 100)
        {
            throw new ArgumentOutOfRangeException(nameof(batchSize));
        }

        var now = DateTimeOffset.UtcNow;
        var leaseId = Guid.NewGuid();
        var strategy = dbContext.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            dbContext.ChangeTracker.Clear();
            await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
            var messages = await dbContext.OutboxMessages.FromSqlInterpolated($"""
                SELECT TOP ({batchSize}) *
                FROM [integration].[OutboxMessages] WITH (UPDLOCK, READPAST, ROWLOCK, READCOMMITTEDLOCK)
                WHERE [ProcessedAtUtc] IS NULL
                  AND [DeadLetteredAtUtc] IS NULL
                  AND [NextAttemptAtUtc] <= {now}
                  AND ([LeaseExpiresAtUtc] IS NULL OR [LeaseExpiresAtUtc] <= {now})
                ORDER BY [OccurredAtUtc], [Id]
                """).ToListAsync(cancellationToken);

            foreach (var message in messages)
            {
                message.Lease(leaseId, now.Add(LeaseDuration));
            }

            await dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return (IReadOnlyList<LeasedOutboxMessage>)messages.Select(message => new LeasedOutboxMessage(
                message.Id, leaseId, message.EventType, message.Payload, message.OccurredAtUtc)).ToArray();
        });
    }

    public async Task MarkProcessedAsync(Guid id, Guid leaseId, CancellationToken cancellationToken)
    {
        var message = await dbContext.OutboxMessages.SingleOrDefaultAsync(
            item => item.Id == id && item.LeaseId == leaseId && item.ProcessedAtUtc == null,
            cancellationToken);
        if (message is null) return;
        message.MarkProcessed(DateTimeOffset.UtcNow);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkFailedAsync(Guid id, Guid leaseId, string errorType, CancellationToken cancellationToken)
    {
        var message = await dbContext.OutboxMessages.SingleOrDefaultAsync(
            item => item.Id == id && item.LeaseId == leaseId && item.ProcessedAtUtc == null,
            cancellationToken);
        if (message is null) return;
        message.MarkFailed(DateTimeOffset.UtcNow, errorType);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
