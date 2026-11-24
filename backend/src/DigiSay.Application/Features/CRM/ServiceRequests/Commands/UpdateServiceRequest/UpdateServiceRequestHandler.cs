using DigiSay.Application.Common.Organizations;
using DigiSay.Application.Features.CRM.ServiceRequests.Abstractions;
using DigiSay.Domain.Entities.CRM;

namespace DigiSay.Application.Features.CRM.ServiceRequests.Commands.UpdateServiceRequest;

public sealed class UpdateServiceRequestHandler(IServiceRequestStore store)
{
    public async Task<ServiceRequest?> HandleAsync(Guid id, UpdateServiceRequestCommand command, IOrganizationContext scope, CancellationToken cancellationToken)
    {
        var request = await store.FindServiceRequestAsync(scope.OrganizationId, id, cancellationToken);
        if (request is null) return null;
        request.Update(command.Title, command.Description, command.Service, scope.UserId);
        await store.SaveChangesAsync(cancellationToken);
        return request;
    }
}
