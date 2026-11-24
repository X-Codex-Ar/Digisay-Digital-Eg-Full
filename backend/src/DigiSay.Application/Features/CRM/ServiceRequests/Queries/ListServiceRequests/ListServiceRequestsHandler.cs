using DigiSay.Application.Common.Organizations;
using DigiSay.Application.Common.Pagination;
using DigiSay.Application.Features.CRM.ServiceRequests.Abstractions;
using DigiSay.Domain.Entities.CRM;

namespace DigiSay.Application.Features.CRM.ServiceRequests.Queries.ListServiceRequests;

public sealed class ListServiceRequestsHandler(IServiceRequestStore store)
{
    public Task<PageSlice<ServiceRequest>> HandleAsync(ListServiceRequestsQuery query, IOrganizationContext scope, CancellationToken cancellationToken) =>
        store.ListServiceRequestsAsync(scope.OrganizationId, query.Skip, query.Take, cancellationToken);
}
