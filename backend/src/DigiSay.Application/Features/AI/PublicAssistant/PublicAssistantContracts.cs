namespace DigiSay.Application.Features.AI.PublicAssistant;

public sealed record PublicAssistantQuestion(string Question);

public sealed record PublicFaqSource(string Id, string Title, string Path, string Content);

public sealed record PublicAssistantCitation(string Id, string Title, string Path);

public sealed record PublicAssistantAnswer(
    string Answer,
    IReadOnlyList<PublicAssistantCitation> Sources,
    bool NeedsHumanFollowUp);

/// <summary>Searches only the curated, public FAQ corpus. Implementations must never read tenant data.</summary>
public interface IPublicFaqSearchTool
{
    Task<IReadOnlyList<PublicFaqSource>> SearchAsync(string question, int maximumResults, CancellationToken cancellationToken);
}

/// <summary>A backend-only text completion port. Provider credentials must never leave Infrastructure.</summary>
public interface ILanguageModelProvider
{
    Task<string> CompleteAsync(string systemPrompt, string userPrompt, CancellationToken cancellationToken);
}

public sealed class PublicAssistantUnavailableException(string message, Exception? innerException = null)
    : Exception(message, innerException);

public sealed class PublicAssistantInputException(string message) : Exception(message);
