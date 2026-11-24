using DigiSay.Application.Common.Pagination;
using DigiSay.Domain.Entities.CRM;

namespace DigiSay.Application.Features.CRM.ServiceRequests.Abstractions;

public interface IServiceRequestStore
{
    Task AddAsync(ServiceRequest request, CancellationToken cancellationToken);
    Task<ServiceRequest?> FindServiceRequestAsync(Guid organizationId, Guid id, CancellationToken cancellationToken);
    Task<PageSlice<ServiceRequest>> ListServiceRequestsAsync(Guid organizationId, int skip, int take, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
