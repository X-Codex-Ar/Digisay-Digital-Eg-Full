using DigiSay.Application.Features.Organizations.Abstractions;

namespace DigiSay.Application.Features.Organizations.Queries.ListMyOrganizations;

public sealed class ListMyOrganizationsHandler(IOrganizationStore store)
{
    public Task<IReadOnlyList<OrganizationMembershipInfo>> HandleAsync(ListMyOrganizationsQuery query, CancellationToken cancellationToken) =>
        store.ListForUserAsync(query.UserId, cancellationToken);
}
