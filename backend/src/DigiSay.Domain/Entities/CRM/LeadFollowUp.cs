using DigiSay.Domain.Abstractions;
using DigiSay.Domain.Exceptions;

namespace DigiSay.Domain.Entities.CRM;

public sealed class LeadFollowUp : IOrganizationOwned
{
    private LeadFollowUp() { }

    public Guid Id { get; private set; }
    public Guid OrganizationId { get; private set; }
    public Guid LeadId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Details { get; private set; }
    public DateTimeOffset DueAtUtc { get; private set; }
    public Guid CreatedByUserId { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset? CompletedAtUtc { get; private set; }
    public Guid? CompletedByUserId { get; private set; }
    public byte[] RowVersion { get; private set; } = [];

    public static LeadFollowUp Create(Guid organizationId, Guid leadId, string title, string? details, DateTimeOffset dueAtUtc, Guid actorUserId)
    {
        var normalizedTitle = title?.Trim();
        var normalizedDetails = string.IsNullOrWhiteSpace(details) ? null : details.Trim();
        if (organizationId == Guid.Empty || leadId == Guid.Empty || actorUserId == Guid.Empty)
            throw new DomainValidationException(nameof(organizationId), "Organization, lead, and actor ids are required.");
        if (string.IsNullOrWhiteSpace(normalizedTitle) || normalizedTitle.Length > 160)
            throw new DomainValidationException(nameof(Title), "Follow-up title must contain 1 to 160 characters.");
        if (normalizedDetails?.Length > 2000)
            throw new DomainValidationException(nameof(Details), "Follow-up details cannot exceed 2000 characters.");
        if (dueAtUtc == default)
            throw new DomainValidationException(nameof(DueAtUtc), "Due date is required.");

        return new LeadFollowUp
        {
            Id = Guid.NewGuid(), OrganizationId = organizationId, LeadId = leadId,
            Title = normalizedTitle, Details = normalizedDetails, DueAtUtc = dueAtUtc.ToUniversalTime(),
            CreatedByUserId = actorUserId, CreatedAtUtc = DateTimeOffset.UtcNow,
        };
    }

    public bool TryComplete(Guid actorUserId)
    {
        if (actorUserId == Guid.Empty || CompletedAtUtc is not null) return false;
        CompletedByUserId = actorUserId;
        CompletedAtUtc = DateTimeOffset.UtcNow;
        return true;
    }
}
