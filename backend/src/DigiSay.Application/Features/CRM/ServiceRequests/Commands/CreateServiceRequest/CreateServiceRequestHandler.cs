using DigiSay.Application.Common.Organizations;
using DigiSay.Application.Features.CRM.ServiceRequests.Abstractions;
using DigiSay.Domain.Entities.CRM;

namespace DigiSay.Application.Features.CRM.ServiceRequests.Commands.CreateServiceRequest;

public sealed class CreateServiceRequestHandler(IServiceRequestStore store)
{
    public async Task<ServiceRequest> HandleAsync(CreateServiceRequestCommand command, IOrganizationContext scope, CancellationToken cancellationToken)
    {
        var request = ServiceRequest.Create(scope.OrganizationId, command.Title, command.Description, command.Service, scope.UserId);
        await store.AddAsync(request, cancellationToken);
        return request;
    }
}
