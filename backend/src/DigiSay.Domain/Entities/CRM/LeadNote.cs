using DigiSay.Domain.Abstractions;
using DigiSay.Domain.Exceptions;

namespace DigiSay.Domain.Entities.CRM;

public sealed class LeadNote : IOrganizationOwned
{
    private LeadNote() { }

    public Guid Id { get; private set; }
    public Guid OrganizationId { get; private set; }
    public Guid LeadId { get; private set; }
    public string Content { get; private set; } = string.Empty;
    public Guid CreatedByUserId { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }

    public static LeadNote Create(Guid organizationId, Guid leadId, string content, Guid actorUserId)
    {
        var normalized = content?.Trim();
        if (organizationId == Guid.Empty || leadId == Guid.Empty || actorUserId == Guid.Empty)
            throw new DomainValidationException(nameof(organizationId), "Organization, lead, and actor ids are required.");
        if (string.IsNullOrWhiteSpace(normalized) || normalized.Length > 4000)
            throw new DomainValidationException(nameof(Content), "Note content must contain 1 to 4000 characters.");

        return new LeadNote
        {
            Id = Guid.NewGuid(), OrganizationId = organizationId, LeadId = leadId,
            Content = normalized, CreatedByUserId = actorUserId, CreatedAtUtc = DateTimeOffset.UtcNow,
        };
    }
}
