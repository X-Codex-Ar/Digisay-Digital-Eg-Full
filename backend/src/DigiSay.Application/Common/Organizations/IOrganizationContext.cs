namespace DigiSay.Application.Common.Organizations;

/// <summary>Organization scope resolved from verified server-side user membership.</summary>
public interface IOrganizationContext
{
    Guid OrganizationId { get; }
    Guid UserId { get; }
    string MembershipRole { get; }
}
