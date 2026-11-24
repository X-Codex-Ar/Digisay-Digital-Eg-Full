using DigiSay.Application.Features.Organizations.Abstractions;

namespace DigiSay.Application.Features.Organizations.Queries.GetCurrentOrganization;

public sealed class GetCurrentOrganizationHandler(IOrganizationStore store)
{
    public async Task<OrganizationMembershipInfo?> HandleAsync(GetCurrentOrganizationQuery query, CancellationToken cancellationToken)
    {
        var organization = await store.FindAsync(query.OrganizationId, cancellationToken);
        return organization is null
            ? null
            : new OrganizationMembershipInfo(organization.Id, organization.Name, query.MembershipRole);
    }
}
