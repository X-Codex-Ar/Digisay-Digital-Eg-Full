namespace DigiSay.Application.Features.AI.ServiceRequestTriage;

/// <summary>
/// Provider-neutral input for staff-reviewed service-request triage.
/// Do not add organization identifiers, contact details, or unrelated CRM data here.
/// </summary>
public sealed record ServiceRequestTriageInput(string Service, string Title, string Description);

/// <summary>
/// Untrusted model output. Validate it before returning it to an API client.
/// </summary>
public sealed record ServiceRequestTriageSuggestion(
    string Category,
    TriageUrgency Urgency,
    string Rationale);

/// <summary>
/// Removes or minimizes sensitive free text before an inference provider sees it.
/// A provider adapter must not bypass this application boundary.
/// </summary>
public interface IServiceRequestTriageDataMinimizer
{
    ServiceRequestTriageInput Minimize(ServiceRequestTriageInput input);
}

public enum TriageUrgency
{
    Low,
    Normal,
    High,
}

/// <summary>
/// Infrastructure implements this port only after a provider and data-processing policy are approved.
/// The implementation must stamp provenance from trusted configuration, not model-generated text.
/// </summary>
public interface IServiceRequestTriageProvider
{
    Task<ServiceRequestTriageSuggestion> SuggestAsync(
        ServiceRequestTriageInput input,
        CancellationToken cancellationToken);
}
