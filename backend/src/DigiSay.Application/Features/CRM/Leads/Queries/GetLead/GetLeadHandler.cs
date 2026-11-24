using DigiSay.Application.Common.Organizations;
using DigiSay.Application.Features.CRM.Leads.Abstractions;
using DigiSay.Domain.Entities.CRM;

namespace DigiSay.Application.Features.CRM.Leads.Queries.GetLead;

public sealed class GetLeadHandler(ILeadStore store)
{
    public Task<Lead?> HandleAsync(GetLeadQuery query, IOrganizationContext scope, CancellationToken cancellationToken) =>
        store.FindLeadAsync(scope.OrganizationId, query.Id, cancellationToken);
}
