using DigiSay.Application.Common.Organizations;
using DigiSay.Application.Features.CRM.ServiceRequests.Abstractions;
using DigiSay.Domain.Entities.CRM;

namespace DigiSay.Application.Features.CRM.ServiceRequests.Queries.GetServiceRequest;

public sealed class GetServiceRequestHandler(IServiceRequestStore store)
{
    public Task<ServiceRequest?> HandleAsync(GetServiceRequestQuery query, IOrganizationContext scope, CancellationToken cancellationToken) =>
        store.FindServiceRequestAsync(scope.OrganizationId, query.Id, cancellationToken);
}
