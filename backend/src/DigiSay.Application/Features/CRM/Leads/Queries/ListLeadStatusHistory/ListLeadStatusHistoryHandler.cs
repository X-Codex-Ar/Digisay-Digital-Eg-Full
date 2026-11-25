using DigiSay.Application.Common.Pagination;
using DigiSay.Application.Features.CRM.Leads.Abstractions;
using DigiSay.Domain.Entities.CRM;

namespace DigiSay.Application.Features.CRM.Leads.Queries.ListLeadStatusHistory;

public sealed class ListLeadStatusHistoryHandler(ILeadStore store)
{
    public Task<PageSlice<LeadStatusHistory>> HandleAsync(Guid leadId, int skip, int take, Guid organizationId, CancellationToken cancellationToken) =>
        store.ListStatusHistoryAsync(organizationId, leadId, skip, take, cancellationToken);
}
