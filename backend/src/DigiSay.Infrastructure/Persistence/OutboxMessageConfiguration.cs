using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiSay.Infrastructure.Persistence;

internal sealed class OutboxMessageConfiguration : IEntityTypeConfiguration<OutboxMessage>
{
    public void Configure(EntityTypeBuilder<OutboxMessage> builder)
    {
        builder.ToTable("OutboxMessages", "integration");
        builder.HasKey(message => message.Id);
        builder.Property(message => message.Id).ValueGeneratedNever();
        builder.Property(message => message.EventType).HasMaxLength(160).IsRequired();
        builder.Property(message => message.Payload).HasMaxLength(16000).IsRequired();
        builder.Property(message => message.AttemptCount).HasDefaultValue(0);
        builder.Property(message => message.OccurredAtUtc).HasPrecision(3).IsRequired();
        builder.Property(message => message.NextAttemptAtUtc).HasPrecision(3).IsRequired();
        builder.Property(message => message.LeaseExpiresAtUtc).HasPrecision(3);
        builder.Property(message => message.ProcessedAtUtc).HasPrecision(3);
        builder.Property(message => message.DeadLetteredAtUtc).HasPrecision(3);
        builder.Property(message => message.LastError).HasMaxLength(200);
        builder.HasIndex(message => new
        {
            message.NextAttemptAtUtc,
            message.LeaseExpiresAtUtc,
            message.OccurredAtUtc,
        }).HasDatabaseName("IX_OutboxMessages_Dispatch")
            .HasFilter("[ProcessedAtUtc] IS NULL AND [DeadLetteredAtUtc] IS NULL");
    }
}
