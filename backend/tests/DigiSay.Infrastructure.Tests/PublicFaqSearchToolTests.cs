using DigiSay.Infrastructure.AI;
using Xunit;

namespace DigiSay.Infrastructure.Tests;

public sealed class PublicFaqSearchToolTests
{
    [Fact]
    public async Task Retrieves_public_service_facts_for_arabic_questions_with_same_site_citations()
    {
        var tool = new PublicFaqSearchTool();

        var results = await tool.SearchAsync("ما هي الخدمات التي تقدمها ديجيساي؟", 4, CancellationToken.None);

        Assert.Contains(results, source => source.Id == "services" && source.Path == "/services");
        Assert.All(results, source => Assert.StartsWith("/", source.Path, StringComparison.Ordinal));
    }

    [Fact]
    public async Task Returns_no_source_for_unsupported_questions_and_caps_results()
    {
        var tool = new PublicFaqSearchTool();

        var unsupported = await tool.SearchAsync("What is the weather in Cairo?", 4, CancellationToken.None);
        var supported = await tool.SearchAsync("Tell me about services and content production", 100, CancellationToken.None);

        Assert.Empty(unsupported);
        Assert.InRange(supported.Count, 1, 4);
    }
}
