using DigiSay.Domain.Abstractions;
using DigiSay.Domain.Enums;

namespace DigiSay.Domain.Entities.CRM;

public sealed class LeadStatusHistory : IOrganizationOwned
{
    private LeadStatusHistory() { }

    public Guid Id { get; private set; }
    public Guid OrganizationId { get; private set; }
    public Guid LeadId { get; private set; }
    public LeadStatus? FromStatus { get; private set; }
    public LeadStatus ToStatus { get; private set; }
    public Guid ChangedByUserId { get; private set; }
    public DateTimeOffset ChangedAtUtc { get; private set; }

    public static LeadStatusHistory Create(Guid organizationId, Guid leadId, LeadStatus? fromStatus, LeadStatus toStatus, Guid actorUserId) => new()
    {
        Id = Guid.NewGuid(), OrganizationId = organizationId, LeadId = leadId,
        FromStatus = fromStatus, ToStatus = toStatus, ChangedByUserId = actorUserId,
        ChangedAtUtc = DateTimeOffset.UtcNow,
    };
}
