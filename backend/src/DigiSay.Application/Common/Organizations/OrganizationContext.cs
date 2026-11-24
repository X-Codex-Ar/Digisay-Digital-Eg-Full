namespace DigiSay.Application.Common.Organizations;

public sealed class OrganizationContext : IOrganizationContext
{
    public Guid OrganizationId { get; private set; }
    public Guid UserId { get; private set; }
    public string MembershipRole { get; private set; } = string.Empty;

    public void Set(Guid organizationId, Guid userId, string membershipRole)
    {
        if (OrganizationId != Guid.Empty)
        {
            throw new InvalidOperationException("Organization context can only be set once per request.");
        }

        if (organizationId == Guid.Empty)
        {
            throw new ArgumentException("Organization id is required.", nameof(organizationId));
        }

        if (userId == Guid.Empty)
        {
            throw new ArgumentException("User id is required.", nameof(userId));
        }

        if (string.IsNullOrWhiteSpace(membershipRole))
        {
            throw new ArgumentException("Membership role is required.", nameof(membershipRole));
        }

        OrganizationId = organizationId;
        UserId = userId;
        MembershipRole = membershipRole.Trim();
    }
}
