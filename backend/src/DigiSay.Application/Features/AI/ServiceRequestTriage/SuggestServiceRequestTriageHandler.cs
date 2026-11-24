using DigiSay.Application.Common.Organizations;
using DigiSay.Application.Features.CRM.ServiceRequests.Abstractions;

namespace DigiSay.Application.Features.AI.ServiceRequestTriage;

public sealed class SuggestServiceRequestTriageHandler(
    IServiceRequestStore requestStore,
    IServiceRequestTriageDataMinimizer dataMinimizer,
    IServiceRequestTriageProvider provider)
{
    public async Task<ServiceRequestTriageResult> HandleAsync(
        Guid requestId,
        IOrganizationContext organization,
        CancellationToken cancellationToken)
    {
        if (requestId == Guid.Empty || organization.OrganizationId == Guid.Empty)
        {
            throw new ArgumentException("A service request and verified organization are required.");
        }

        var request = await requestStore.FindServiceRequestAsync(
            organization.OrganizationId,
            requestId,
            cancellationToken);
        if (request is null)
        {
            return ServiceRequestTriageResult.NotFound;
        }

        var input = dataMinimizer.Minimize(
            new ServiceRequestTriageInput(request.Service, request.Title, request.Description));
        var suggestion = ServiceRequestTriageOutputValidator.Validate(
            await provider.SuggestAsync(input, cancellationToken));

        return new ServiceRequestTriageResult(true, suggestion, RequiresHumanReview: true);
    }
}

public sealed record ServiceRequestTriageResult(
    bool Found,
    ServiceRequestTriageSuggestion? Suggestion,
    bool RequiresHumanReview)
{
    public static ServiceRequestTriageResult NotFound { get; } = new(false, null, true);
}
