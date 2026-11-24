using DigiSay.Domain.Enums;
using DigiSay.Domain.Exceptions;

namespace DigiSay.Domain.Entities.Organizations;

public sealed class OrganizationMembership
{
    private OrganizationMembership() { }

    public Guid OrganizationId { get; private set; }
    public Guid UserId { get; private set; }
    public string Role { get; private set; } = string.Empty;
    public OrganizationMembershipStatus Status { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public Organization? Organization { get; private set; }

    public static OrganizationMembership CreateOwner(Guid organizationId, Guid userId)
    {
        if (organizationId == Guid.Empty)
        {
            throw new DomainValidationException(nameof(organizationId), "Organization id is required.");
        }

        if (userId == Guid.Empty)
        {
            throw new DomainValidationException(nameof(userId), "User id is required.");
        }

        return new OrganizationMembership
        {
            OrganizationId = organizationId,
            UserId = userId,
            Role = "Owner",
            Status = OrganizationMembershipStatus.Active,
            CreatedAtUtc = DateTimeOffset.UtcNow,
        };
    }
}
