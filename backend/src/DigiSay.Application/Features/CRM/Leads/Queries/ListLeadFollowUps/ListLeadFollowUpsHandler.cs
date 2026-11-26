using DigiSay.Application.Common.Pagination;
using DigiSay.Application.Features.CRM.Leads.Abstractions;
using DigiSay.Domain.Entities.CRM;

namespace DigiSay.Application.Features.CRM.Leads.Queries.ListLeadFollowUps;

public sealed class ListLeadFollowUpsHandler(ILeadStore store)
{
    public Task<PageSlice<LeadFollowUp>> HandleAsync(Guid leadId, int skip, int take, Guid organizationId, CancellationToken cancellationToken) =>
        store.ListFollowUpsAsync(organizationId, leadId, skip, take, cancellationToken);
}
