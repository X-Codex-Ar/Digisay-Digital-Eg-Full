using DigiSay.Application.Features.Organizations.Abstractions;
using DigiSay.Domain.Entities.Organizations;
using DigiSay.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace DigiSay.Infrastructure.Persistence;

internal sealed class OrganizationStore(DigiSayDbContext dbContext) : IOrganizationStore
{
    public async Task AddAsync(Organization organization, OrganizationMembership ownerMembership, CancellationToken cancellationToken)
    {
        dbContext.Organizations.Add(organization);
        dbContext.OrganizationMemberships.Add(ownerMembership);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<OrganizationMembershipInfo>> ListForUserAsync(Guid userId, CancellationToken cancellationToken) =>
        await dbContext.OrganizationMemberships
            .AsNoTracking()
            .Where(membership => membership.UserId == userId && membership.Status == OrganizationMembershipStatus.Active)
            .OrderBy(membership => membership.Organization!.Name)
            .Select(membership => new OrganizationMembershipInfo(
                membership.OrganizationId, membership.Organization!.Name, membership.Role))
            .ToListAsync(cancellationToken);

    public Task<OrganizationMembershipInfo?> FindActiveMembershipAsync(Guid organizationId, Guid userId, CancellationToken cancellationToken) =>
        dbContext.OrganizationMemberships
            .AsNoTracking()
            .Where(membership => membership.OrganizationId == organizationId &&
                membership.UserId == userId && membership.Status == OrganizationMembershipStatus.Active)
            .Select(membership => new OrganizationMembershipInfo(
                membership.OrganizationId, membership.Organization!.Name, membership.Role))
            .SingleOrDefaultAsync(cancellationToken);

    public Task<Organization?> FindAsync(Guid organizationId, CancellationToken cancellationToken) =>
        dbContext.Organizations.AsNoTracking().SingleOrDefaultAsync(item => item.Id == organizationId, cancellationToken);
}
