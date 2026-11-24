using DigiSay.Application.Common.Pagination;
using DigiSay.Domain.Entities.CRM;

namespace DigiSay.Application.Features.CRM.Leads.Abstractions;

public interface ILeadStore
{
    Task AddAsync(Lead lead, CancellationToken cancellationToken);
    Task<Lead?> FindLeadAsync(Guid organizationId, Guid id, CancellationToken cancellationToken);
    Task<PageSlice<Lead>> ListLeadsAsync(Guid organizationId, int skip, int take, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
