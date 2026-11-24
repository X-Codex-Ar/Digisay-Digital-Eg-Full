using DigiSay.Domain.Entities.Organizations;

namespace DigiSay.Application.Features.Organizations.Abstractions;

public sealed record OrganizationMembershipInfo(Guid OrganizationId, string OrganizationName, string MembershipRole);

public interface IOrganizationStore
{
    Task AddAsync(Organization organization, OrganizationMembership ownerMembership, CancellationToken cancellationToken);
    Task<IReadOnlyList<OrganizationMembershipInfo>> ListForUserAsync(Guid userId, CancellationToken cancellationToken);
    Task<OrganizationMembershipInfo?> FindActiveMembershipAsync(Guid organizationId, Guid userId, CancellationToken cancellationToken);
    Task<Organization?> FindAsync(Guid organizationId, CancellationToken cancellationToken);
}
