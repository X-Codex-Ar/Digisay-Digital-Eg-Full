using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using DigiSay.Application.Features.AI.PublicAssistant;
using Microsoft.Extensions.Options;

namespace DigiSay.Infrastructure.AI;

/// <summary>
/// Optional adapter for OpenAI's Responses API.
/// The application layer depends only on ILanguageModelProvider; this adapter is disabled unless configured.
/// </summary>
public sealed class OpenAiResponsesLanguageModelProvider(
    HttpClient httpClient,
    IOptions<OpenAiProviderOptions> options) : ILanguageModelProvider
{
    private const int MaximumResponseBytes = 64 * 1024;
    private readonly OpenAiProviderOptions _options = options.Value;

    public async Task<string> CompleteAsync(
        string systemPrompt,
        string userPrompt,
        CancellationToken cancellationToken)
    {
        var endpoint = GetValidatedEndpoint();
        if (!_options.Enabled || string.IsNullOrWhiteSpace(_options.ApiKey) ||
            string.IsNullOrWhiteSpace(_options.Model))
        {
            throw new PublicAssistantUnavailableException("The language model provider is not enabled.");
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, endpoint)
        {
            Content = JsonContent.Create(new ResponsesRequest(
                _options.Model,
                systemPrompt,
                userPrompt,
                _options.MaximumOutputTokens,
                Store: false)),
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);

        try
        {
            using var response = await httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                throw new PublicAssistantUnavailableException("The language model provider rejected the request.");
            }

            await response.Content.LoadIntoBufferAsync(MaximumResponseBytes, cancellationToken);
            var completion = await response.Content.ReadFromJsonAsync<ResponseResult>(cancellationToken);
            var answer = completion?.Output
                .Where(item => string.Equals(item.Type, "message", StringComparison.Ordinal))
                .SelectMany(item => item.Content)
                .Where(item => string.Equals(item.Type, "output_text", StringComparison.Ordinal))
                .Select(item => item.Text)
                .FirstOrDefault(text => !string.IsNullOrWhiteSpace(text));
            return string.IsNullOrWhiteSpace(answer)
                ? throw new PublicAssistantUnavailableException("The language model provider returned no answer.")
                : answer;
        }
        catch (PublicAssistantUnavailableException)
        {
            throw;
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            throw new PublicAssistantUnavailableException("The language model provider timed out.");
        }
        catch (HttpRequestException exception)
        {
            throw new PublicAssistantUnavailableException("The language model provider is unavailable.", exception);
        }
        catch (JsonException exception)
        {
            throw new PublicAssistantUnavailableException("The language model provider returned an invalid response.", exception);
        }
    }

    private Uri GetValidatedEndpoint()
    {
        if (!Uri.TryCreate(_options.Endpoint, UriKind.Absolute, out var endpoint) ||
            endpoint.Scheme != Uri.UriSchemeHttps ||
            !string.Equals(endpoint.Host, "api.openai.com", StringComparison.OrdinalIgnoreCase) ||
            endpoint.AbsolutePath != "/v1/responses" ||
            !string.IsNullOrEmpty(endpoint.UserInfo) ||
            !string.IsNullOrEmpty(endpoint.Query) ||
            !string.IsNullOrEmpty(endpoint.Fragment))
        {
            throw new PublicAssistantUnavailableException("The language model provider endpoint is not configured safely.");
        }

        return endpoint;
    }

    private sealed record ResponsesRequest(
        string Model,
        string Instructions,
        string Input,
        [property: JsonPropertyName("max_output_tokens")] int MaximumOutputTokens,
        bool Store);

    private sealed record ResponseResult(IReadOnlyList<ResponseOutputItem> Output);

    private sealed record ResponseOutputItem(string Type, IReadOnlyList<ResponseContentItem> Content);

    private sealed record ResponseContentItem(string Type, string? Text);
}
