using DigiSay.Application.Features.AI.PublicAssistant;
using Xunit;

namespace DigiSay.Application.Tests;

public sealed class PublicFaqAssistantTests
{
    [Fact]
    public async Task Answer_uses_only_retrieved_public_sources_and_returns_server_owned_citations()
    {
        var source = new PublicFaqSource("services", "DigiSay services", "/services", "Content production and social media.");
        var search = new FakeFaqSearch([source]);
        var model = new FakeLanguageModel("DigiSay offers content production and social media services.");

        var answer = await new PublicFaqAssistantHandler(search, model).HandleAsync("What services do you offer?", CancellationToken.None);

        Assert.Equal(source, Assert.Single(search.Results));
        Assert.Contains("APPROVED PUBLIC SOURCES", model.UserPrompt);
        Assert.Single(answer.Sources);
        Assert.Equal("/services", answer.Sources[0].Path);
        Assert.False(answer.NeedsHumanFollowUp);
    }

    [Fact]
    public async Task Unsupported_question_returns_safe_contact_handoff_without_calling_model()
    {
        var search = new FakeFaqSearch([]);
        var model = new FakeLanguageModel("Must not be called.");
        var answer = await new PublicFaqAssistantHandler(search, model)
            .HandleAsync("What is your unlisted price?", CancellationToken.None);

        Assert.Equal(1, search.CallCount);
        Assert.True(answer.NeedsHumanFollowUp);
        Assert.Empty(answer.Sources);
        Assert.Contains("contact form", answer.Answer, StringComparison.OrdinalIgnoreCase);
        Assert.Null(model.UserPrompt);
    }

    [Theory]
    [InlineData("Email me at visitor@example.com")]
    [InlineData("Call me at +1 (202) 555-0183")]
    [InlineData("")]
    public async Task Rejects_personal_contact_details_and_empty_questions_before_retrieval(string question)
    {
        var search = new FakeFaqSearch([]);
        var model = new FakeLanguageModel("not called");

        await Assert.ThrowsAsync<PublicAssistantInputException>(() =>
            new PublicFaqAssistantHandler(search, model).HandleAsync(question, CancellationToken.None));

        Assert.Equal(0, search.CallCount);
        Assert.Null(model.UserPrompt);
    }

    [Fact]
    public async Task Rejects_overlong_model_output()
    {
        var search = new FakeFaqSearch([new PublicFaqSource("services", "Services", "/services", "Services.")]);
        var model = new FakeLanguageModel(new string('x', PublicFaqAssistantHandler.MaximumAnswerLength + 1));

        await Assert.ThrowsAsync<PublicAssistantUnavailableException>(() =>
            new PublicFaqAssistantHandler(search, model).HandleAsync("Tell me about services", CancellationToken.None));
    }

    private sealed class FakeFaqSearch(IReadOnlyList<PublicFaqSource> results) : IPublicFaqSearchTool
    {
        public IReadOnlyList<PublicFaqSource> Results { get; private set; } = [];
        public int CallCount { get; private set; }

        public Task<IReadOnlyList<PublicFaqSource>> SearchAsync(string question, int maximumResults, CancellationToken cancellationToken)
        {
            CallCount++;
            Results = results;
            return Task.FromResult(results);
        }
    }

    private sealed class FakeLanguageModel(string answer) : ILanguageModelProvider
    {
        public string? UserPrompt { get; private set; }

        public Task<string> CompleteAsync(string systemPrompt, string userPrompt, CancellationToken cancellationToken)
        {
            Assert.Contains("untrusted data", systemPrompt, StringComparison.OrdinalIgnoreCase);
            UserPrompt = userPrompt;
            return Task.FromResult(answer);
        }
    }
}
