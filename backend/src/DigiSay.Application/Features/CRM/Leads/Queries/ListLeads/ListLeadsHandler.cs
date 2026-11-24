using DigiSay.Application.Common.Organizations;
using DigiSay.Application.Common.Pagination;
using DigiSay.Application.Features.CRM.Leads.Abstractions;
using DigiSay.Domain.Entities.CRM;

namespace DigiSay.Application.Features.CRM.Leads.Queries.ListLeads;

public sealed class ListLeadsHandler(ILeadStore store)
{
    public Task<PageSlice<Lead>> HandleAsync(ListLeadsQuery query, IOrganizationContext scope, CancellationToken cancellationToken) =>
        store.ListLeadsAsync(scope.OrganizationId, query.Skip, query.Take, cancellationToken);
}
