using DigiSay.Application.Common.Pagination;
using DigiSay.Domain.Entities.CRM;
using DigiSay.Domain.Enums;

namespace DigiSay.Application.Features.CRM.Leads.Abstractions;

public interface ILeadStore
{
    Task AddAsync(Lead lead, CancellationToken cancellationToken);
    void AddStatusHistory(LeadStatusHistory history);
    Task<Lead?> FindLeadAsync(Guid organizationId, Guid id, CancellationToken cancellationToken);
    Task<PageSlice<Lead>> ListLeadsAsync(Guid organizationId, int skip, int take, string? search, LeadStatus? status, CancellationToken cancellationToken);
    Task AddNoteAsync(LeadNote note, CancellationToken cancellationToken);
    Task<PageSlice<LeadNote>> ListNotesAsync(Guid organizationId, Guid leadId, int skip, int take, CancellationToken cancellationToken);
    Task AddFollowUpAsync(LeadFollowUp followUp, CancellationToken cancellationToken);
    Task<LeadFollowUp?> FindFollowUpAsync(Guid organizationId, Guid leadId, Guid followUpId, CancellationToken cancellationToken);
    Task<PageSlice<LeadFollowUp>> ListFollowUpsAsync(Guid organizationId, Guid leadId, int skip, int take, CancellationToken cancellationToken);
    Task<PageSlice<LeadStatusHistory>> ListStatusHistoryAsync(Guid organizationId, Guid leadId, int skip, int take, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
