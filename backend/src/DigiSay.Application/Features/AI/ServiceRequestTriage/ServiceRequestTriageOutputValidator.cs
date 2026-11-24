namespace DigiSay.Application.Features.AI.ServiceRequestTriage;

public static class ServiceRequestTriageOutputValidator
{
    public const int MaximumCategoryLength = 80;
    public const int MaximumRationaleLength = 500;

    public static ServiceRequestTriageSuggestion Validate(ServiceRequestTriageSuggestion? suggestion)
    {
        if (suggestion is null)
        {
            throw new ServiceRequestTriageOutputException("The triage provider returned no suggestion.");
        }

        var category = suggestion.Category?.Trim();
        if (string.IsNullOrWhiteSpace(category) || category.Length > MaximumCategoryLength)
        {
            throw new ServiceRequestTriageOutputException("The triage category is empty or too long.");
        }

        if (!Enum.IsDefined(suggestion.Urgency))
        {
            throw new ServiceRequestTriageOutputException("The triage urgency is not supported.");
        }

        var rationale = suggestion.Rationale?.Trim();
        if (string.IsNullOrWhiteSpace(rationale) || rationale.Length > MaximumRationaleLength)
        {
            throw new ServiceRequestTriageOutputException("The triage rationale is empty or too long.");
        }

        return suggestion with { Category = category, Rationale = rationale };
    }
}

public sealed class ServiceRequestTriageOutputException(string message) : Exception(message);
