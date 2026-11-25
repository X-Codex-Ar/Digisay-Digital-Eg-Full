using System.Net;
using System.Text;
using DigiSay.Application.Features.AI.PublicAssistant;
using DigiSay.Infrastructure.AI;
using Microsoft.Extensions.Options;
using Xunit;

namespace DigiSay.Infrastructure.Tests;

public sealed class OpenAiResponsesLanguageModelProviderTests
{
    [Fact]
    public async Task Sends_server_side_credentials_and_bounded_chat_request_to_configured_https_endpoint()
    {
        string? observedAuthorization = null;
        string? observedPayload = null;
        var handler = new RecordingHandler((request, _) =>
        {
            observedAuthorization = request.Headers.Authorization?.ToString();
            observedPayload = request.Content!.ReadAsStringAsync().GetAwaiter().GetResult();
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent("{\"output\":[{\"type\":\"message\",\"content\":[{\"type\":\"output_text\",\"text\":\"Hello from approved public sources.\"}]}]}", Encoding.UTF8, "application/json"),
            });
        });
        var provider = CreateProvider(handler);

        var result = await provider.CompleteAsync("system", "question", CancellationToken.None);

        Assert.Equal("Hello from approved public sources.", result);
        Assert.Equal("Bearer test-secret-not-for-frontend", observedAuthorization);
        Assert.Contains("\"model\":\"test-model\"", observedPayload, StringComparison.Ordinal);
        Assert.Contains("\"max_output_tokens\":100", observedPayload, StringComparison.Ordinal);
        Assert.Contains("\"store\":false", observedPayload, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Rejects_non_https_provider_endpoint()
    {
        var options = Options.Create(new OpenAiProviderOptions
        {
            Enabled = true,
            Endpoint = "http://api.openai.com/v1/responses",
            ApiKey = "secret",
            Model = "model",
        });
        var provider = new OpenAiResponsesLanguageModelProvider(new HttpClient(new RecordingHandler((_, _) =>
            Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)))), options);

        await Assert.ThrowsAsync<PublicAssistantUnavailableException>(() =>
            provider.CompleteAsync("system", "question", CancellationToken.None));
    }

    [Fact]
    public async Task Disabled_provider_reports_not_enabled_before_validating_endpoint()
    {
        var options = Options.Create(new OpenAiProviderOptions { Enabled = false, Endpoint = string.Empty });
        var provider = new OpenAiResponsesLanguageModelProvider(new HttpClient(new RecordingHandler((_, _) =>
            Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)))), options);

        var exception = await Assert.ThrowsAsync<PublicAssistantUnavailableException>(() =>
            provider.CompleteAsync("system", "question", CancellationToken.None));

        Assert.Equal("The language model provider is not enabled.", exception.Message);
    }

    [Fact]
    public async Task Does_not_expose_provider_error_details()
    {
        var handler = new RecordingHandler((_, _) => Task.FromResult(new HttpResponseMessage(HttpStatusCode.InternalServerError)
        {
            Content = new StringContent("sensitive provider response"),
        }));
        var provider = CreateProvider(handler);

        var exception = await Assert.ThrowsAsync<PublicAssistantUnavailableException>(() =>
            provider.CompleteAsync("system", "question", CancellationToken.None));

        Assert.DoesNotContain("sensitive", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Theory]
    [InlineData(HttpStatusCode.TooManyRequests)]
    [InlineData(HttpStatusCode.PaymentRequired)]
    [InlineData(HttpStatusCode.Unauthorized)]
    public async Task Quota_rate_limit_and_auth_failures_become_sanitized_unavailable_errors(HttpStatusCode status)
    {
        var provider = CreateProvider(new RecordingHandler((_, _) => Task.FromResult(new HttpResponseMessage(status)
        {
            Content = new StringContent("insufficient_quota account details"),
        })));

        var exception = await Assert.ThrowsAsync<PublicAssistantUnavailableException>(() =>
            provider.CompleteAsync("system", "question", CancellationToken.None));

        Assert.DoesNotContain("quota", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("account", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Provider_timeout_without_caller_cancellation_becomes_unavailable()
    {
        var provider = CreateProvider(new RecordingHandler((_, _) => throw new TaskCanceledException("timed out")));

        var exception = await Assert.ThrowsAsync<PublicAssistantUnavailableException>(() =>
            provider.CompleteAsync("system", "question", CancellationToken.None));

        Assert.Contains("timed out", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Caller_cancellation_is_not_reported_as_a_provider_timeout()
    {
        using var cts = new CancellationTokenSource();
        cts.Cancel();
        var provider = CreateProvider(new RecordingHandler((_, token) =>
        {
            token.ThrowIfCancellationRequested();
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK));
        }));

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() =>
            provider.CompleteAsync("system", "question", cts.Token));
    }

    [Theory]
    [InlineData("not json")]
    [InlineData("{\"output\":[]}")]
    [InlineData("{\"output\":[{\"type\":\"message\",\"content\":[{\"type\":\"refusal\",\"text\":\"no\"}]}]}")]
    [InlineData("{\"output\":[{\"type\":\"message\",\"content\":[{\"type\":\"output_text\",\"text\":\"   \"}]}]}")]
    public async Task Malformed_or_empty_provider_responses_become_unavailable(string body)
    {
        var provider = CreateProvider(new RecordingHandler((_, _) => Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json"),
        })));

        await Assert.ThrowsAsync<PublicAssistantUnavailableException>(() =>
            provider.CompleteAsync("system", "question", CancellationToken.None));
    }

    private static OpenAiResponsesLanguageModelProvider CreateProvider(HttpMessageHandler handler) =>
        new(new HttpClient(handler), Options.Create(new OpenAiProviderOptions
        {
            Enabled = true,
            Endpoint = "https://api.openai.com/v1/responses",
            ApiKey = "test-secret-not-for-frontend",
            Model = "test-model",
            MaximumOutputTokens = 100,
            TimeoutSeconds = 5,
        }));

    private sealed class RecordingHandler(
        Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> send) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) =>
            send(request, cancellationToken);
    }
}
