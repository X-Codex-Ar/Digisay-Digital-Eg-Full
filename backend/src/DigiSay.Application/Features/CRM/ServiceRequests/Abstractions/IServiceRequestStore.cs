using DigiSay.Application.Common.Pagination;
using DigiSay.Domain.Entities.CRM;
using DigiSay.Domain.Enums;

namespace DigiSay.Application.Features.CRM.ServiceRequests.Abstractions;

public interface IServiceRequestStore
{
    Task AddAsync(ServiceRequest request, CancellationToken cancellationToken);
    Task<ServiceRequest?> FindServiceRequestAsync(Guid organizationId, Guid id, CancellationToken cancellationToken);
    Task<PageSlice<ServiceRequest>> ListServiceRequestsAsync(Guid organizationId, int skip, int take, string? search, ServiceRequestStatus? status, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
