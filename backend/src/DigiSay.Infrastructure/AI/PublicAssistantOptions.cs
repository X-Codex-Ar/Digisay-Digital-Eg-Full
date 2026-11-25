namespace DigiSay.Infrastructure.AI;

public sealed class PublicAssistantOptions
{
    public const string SectionName = "AI:PublicAssistant";

    public bool Enabled { get; init; }
}

public sealed class OpenAiProviderOptions
{
    public const string SectionName = "AI:OpenAI";

    public bool Enabled { get; init; }
    public string Endpoint { get; init; } = string.Empty;
    public string Model { get; init; } = string.Empty;
    public string ApiKey { get; init; } = string.Empty;
    public int TimeoutSeconds { get; init; } = 15;
    public int MaximumOutputTokens { get; init; } = 400;
}
