namespace DigiSay.Domain.Organizations;

public enum OrganizationMembershipStatus
{
    Invited = 0,
    Active = 1,
    Suspended = 2,
}

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
            throw new ArgumentException("Organization id is required.", nameof(organizationId));
        }

        if (userId == Guid.Empty)
        {
            throw new ArgumentException("User id is required.", nameof(userId));
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
