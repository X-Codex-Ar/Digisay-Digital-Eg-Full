namespace DigiSay.Application.Organizations;

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

        OrganizationId = organizationId;
        UserId = userId;
        MembershipRole = membershipRole;
    }
}
