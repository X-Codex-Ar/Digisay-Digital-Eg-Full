using DigiSay.Application.Common.Pagination;
using DigiSay.Application.Features.CRM.Leads.Abstractions;
using DigiSay.Domain.Entities.CRM;

namespace DigiSay.Application.Features.CRM.Leads.Queries.ListLeadNotes;

public sealed class ListLeadNotesHandler(ILeadStore store)
{
    public Task<PageSlice<LeadNote>> HandleAsync(Guid leadId, int skip, int take, Guid organizationId, CancellationToken cancellationToken) =>
        store.ListNotesAsync(organizationId, leadId, skip, take, cancellationToken);
}
