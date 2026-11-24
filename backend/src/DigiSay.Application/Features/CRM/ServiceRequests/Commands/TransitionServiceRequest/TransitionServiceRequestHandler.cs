using DigiSay.Application.Common.Organizations;
using DigiSay.Application.Features.CRM.ServiceRequests.Abstractions;
using DigiSay.Domain.Entities.CRM;

namespace DigiSay.Application.Features.CRM.ServiceRequests.Commands.TransitionServiceRequest;

public sealed class TransitionServiceRequestHandler(IServiceRequestStore store)
{
    public async Task<ServiceRequestTransitionResult> HandleAsync(Guid id, TransitionServiceRequestCommand command, IOrganizationContext scope, CancellationToken cancellationToken)
    {
        var request = await store.FindServiceRequestAsync(scope.OrganizationId, id, cancellationToken);
        if (request is null) return new ServiceRequestTransitionResult(false, false, null);
        if (!request.TryTransitionTo(command.TargetStatus, scope.UserId)) return new ServiceRequestTransitionResult(true, false, request);
        await store.SaveChangesAsync(cancellationToken);
        return new ServiceRequestTransitionResult(true, true, request);
    }
}
