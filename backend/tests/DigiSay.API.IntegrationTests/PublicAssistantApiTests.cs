using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace DigiSay.API.IntegrationTests;

public sealed class PublicAssistantApiTests
{
    [Fact]
    public async Task Assistant_is_disabled_by_default()
    {
        using var factory = new DigiSayApiFactory();
        using var client = factory.CreateClient();

        using var response = await client.PostAsJsonAsync("/api/v1/ai/public-chat", new { question = "What services do you offer?" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal(0, factory.LanguageModel.CallCount);
    }

    [Fact]
    public async Task Enabled_assistant_returns_answer_with_server_selected_public_sources()
    {
        using var factory = new DigiSayApiFactory(publicAssistantEnabled: true);
        using var client = factory.CreateClient();

        using var response = await client.PostAsJsonAsync("/api/v1/ai/public-chat", new { question = "What services do you offer?" });
        var result = await response.Content.ReadFromJsonAsync<PublicAssistantResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("DigiSay offers content production and social media services.", result!.Answer);
        Assert.Equal("/services", Assert.Single(result.Sources).Path);
        Assert.Equal(1, factory.LanguageModel.CallCount);
    }

    [Fact]
    public async Task Assistant_rejects_contact_details_and_applies_per_ip_rate_limit()
    {
        using var factory = new DigiSayApiFactory(publicAssistantEnabled: true);
        using var client = factory.CreateClient();

        using var personalData = await client.PostAsJsonAsync("/api/v1/ai/public-chat", new { question = "Email me at visitor@example.com" });
        Assert.Equal(HttpStatusCode.BadRequest, personalData.StatusCode);
        Assert.Equal(0, factory.LanguageModel.CallCount);

        // The rejected personal-data request still consumes one permit because the rate-limit
        // filter runs before request validation.
        for (var attempt = 0; attempt < 9; attempt++)
        {
            using var allowed = await client.PostAsJsonAsync("/api/v1/ai/public-chat", new { question = "Tell me about services." });
            Assert.Equal(HttpStatusCode.OK, allowed.StatusCode);
        }

        using var limited = await client.PostAsJsonAsync("/api/v1/ai/public-chat", new { question = "Tell me about services." });
        Assert.Equal((HttpStatusCode)429, limited.StatusCode);
        Assert.Equal(9, factory.LanguageModel.CallCount);
    }

    private sealed record PublicAssistantResponse(string Answer, IReadOnlyList<PublicAssistantSourceResponse> Sources);
    private sealed record PublicAssistantSourceResponse(string Id, string Title, string Path);
}
