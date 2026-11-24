using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using DigiSay.Application.Features.Content.Abstractions;
using DigiSay.Application.Features.Content;
using Microsoft.Extensions.Options;

namespace DigiSay.Infrastructure.Storage.Supabase;

internal sealed class SupabaseStorageAdapter(HttpClient httpClient, IOptions<SupabaseStorageOptions> options)
    : IPrivateObjectStorage
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly SupabaseStorageOptions _options = options.Value;

    public async Task UploadAsync(
        Guid organizationId,
        Guid objectId,
        Stream content,
        string verifiedContentType,
        CancellationToken cancellationToken)
    {
        using var request = CreateRequest(HttpMethod.Post, GetObjectRoute(organizationId, objectId));
        request.Headers.TryAddWithoutValidation("x-upsert", "false");
        var streamContent = new StreamContent(content);
        streamContent.Headers.ContentType = new MediaTypeHeaderValue(verifiedContentType);
        request.Content = streamContent;
        await SendAsync(request, cancellationToken);
    }

    public async Task<Uri> CreateSignedDownloadUrlAsync(
        Guid organizationId,
        Guid objectId,
        TimeSpan expiresIn,
        CancellationToken cancellationToken)
    {
        var seconds = checked((int)expiresIn.TotalSeconds);
        if (seconds is < 1 or > 3600)
        {
            throw new ArgumentOutOfRangeException(nameof(expiresIn), "Signed URL expiry must be between one second and one hour.");
        }

        var route = $"object/sign/{Escape(_options.PrivateBucket)}/{EscapePath(GetObjectPath(organizationId, objectId))}";
        using var request = CreateRequest(HttpMethod.Post, route);
        request.Content = JsonContent.Create(new { expiresIn = seconds }, options: JsonOptions);
        using var response = await SendAsync(request, cancellationToken);
        var payload = await response.Content.ReadFromJsonAsync<SignedUrlResponse>(JsonOptions, cancellationToken);
        if (payload is null || string.IsNullOrWhiteSpace(payload.SignedUrl))
        {
            throw new StorageProviderException("The storage provider returned an invalid signed URL response.");
        }

        var signedUri = ResolveSignedUrl(payload.SignedUrl);
        var builder = new UriBuilder(signedUri);
        builder.Query = string.IsNullOrWhiteSpace(builder.Query)
            ? "download=true"
            : $"{builder.Query.TrimStart('?')}&download=true";
        return builder.Uri;
    }

    public async Task DeleteAsync(Guid organizationId, Guid objectId, CancellationToken cancellationToken)
    {
        using var request = CreateRequest(HttpMethod.Delete, "object/" + Escape(_options.PrivateBucket));
        request.Content = JsonContent.Create(new { prefixes = new[] { GetObjectPath(organizationId, objectId) } }, options: JsonOptions);
        await SendAsync(request, cancellationToken);
    }

    private HttpRequestMessage CreateRequest(HttpMethod method, string route)
    {
        var request = new HttpRequestMessage(method, route);
        request.Headers.TryAddWithoutValidation("apikey", _options.SecretKey);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.SecretKey);
        return request;
    }

    private async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        try
        {
            var response = await httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                return response;
            }

            var statusCode = (int)response.StatusCode;
            response.Dispose();
            throw new StorageProviderException("The private storage provider rejected the request.", statusCode);
        }
        catch (StorageProviderException)
        {
            throw;
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception exception) when (exception is HttpRequestException or TaskCanceledException)
        {
            throw new StorageProviderException("The private storage provider is unavailable.", innerException: exception);
        }
    }

    private Uri ResolveSignedUrl(string signedUrl)
    {
        if (!Uri.TryCreate(signedUrl, UriKind.RelativeOrAbsolute, out var uri))
        {
            throw new StorageProviderException("The storage provider returned an invalid signed URL.");
        }

        var projectUri = new Uri(_options.ProjectUrl.TrimEnd('/') + "/", UriKind.Absolute);
        var resolved = uri.IsAbsoluteUri
            ? uri
            : signedUrl.StartsWith("/object/", StringComparison.Ordinal)
                ? new Uri(projectUri, "storage/v1" + signedUrl)
                : new Uri(projectUri, signedUrl);

        if (resolved.Scheme != Uri.UriSchemeHttps || resolved.Authority != projectUri.Authority)
        {
            throw new StorageProviderException("The storage provider returned a URL outside the configured project.");
        }

        return resolved;
    }

    private string GetObjectRoute(Guid organizationId, Guid objectId) =>
        "object/" + Escape(_options.PrivateBucket) + "/" + EscapePath(GetObjectPath(organizationId, objectId));

    private static string GetObjectPath(Guid organizationId, Guid objectId) =>
        $"organizations/{organizationId:N}/{objectId:N}";

    private static string EscapePath(string path) =>
        string.Join('/', path.Split('/').Select(Escape));

    private static string Escape(string segment) => Uri.EscapeDataString(segment);

    private sealed record SignedUrlResponse(string? SignedUrl);
}
