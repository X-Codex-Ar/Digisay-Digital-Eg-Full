using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Globalization;
using System.Text.Json.Serialization;
using DigiSay.Application.Features.Content.Abstractions;
using DigiSay.Application.Features.Content;
using Microsoft.Extensions.Options;

namespace DigiSay.Infrastructure.Storage.Supabase;

internal sealed class SupabaseStorageAdapter(HttpClient httpClient, IOptions<SupabaseStorageOptions> options)
    : IPrivateObjectStorage
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly SupabaseStorageOptions _options = options.Value;

    public async Task<IReadOnlyList<StorageObject>> ListAsync(Guid organizationId, CancellationToken cancellationToken)
    {
        if (organizationId == Guid.Empty)
        {
            throw new StorageProviderException("A verified organization is required.", (int)HttpStatusCode.BadRequest);
        }

        using var request = CreateRequest(HttpMethod.Post, "object/list/" + Escape(_options.PrivateBucket));
        request.Content = JsonContent.Create(new
        {
            prefix = $"organizations/{organizationId:N}/",
            limit = 1000,
            offset = 0,
            sortBy = new { column = "created_at", order = "desc" },
        }, options: JsonOptions);

        using var response = await SendAsync(request, cancellationToken);
        var objects = await response.Content.ReadFromJsonAsync<IReadOnlyList<StorageListEntry>>(JsonOptions, cancellationToken)
            ?? throw new StorageProviderException("The private storage provider returned an invalid object listing.");

        return objects
            .Where(item => Guid.TryParseExact(item.Name, "N", out _))
            .Select(item => new StorageObject(
                Guid.ParseExact(item.Name!, "N"),
                ReadString(item.Metadata, "mimetype") ?? "application/octet-stream",
                ReadInt64(item.Metadata, "size"),
                item.CreatedAtUtc ?? DateTimeOffset.MinValue))
            .ToArray();
    }

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
        using var response = await SendAsync(request, cancellationToken);
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
        using var parseTimeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        parseTimeout.CancelAfter(httpClient.Timeout);
        SignedUrlResponse? payload;
        try
        {
            payload = await response.Content.ReadFromJsonAsync<SignedUrlResponse>(JsonOptions, parseTimeout.Token);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            throw new StorageProviderException("The private storage provider is unavailable.");
        }
        catch (JsonException exception)
        {
            throw new StorageProviderException("The storage provider returned an invalid signed URL response.", innerException: exception);
        }

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
        using var response = await SendAsync(request, cancellationToken);
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

    private sealed record StorageListEntry(
        string? Name,
        [property: JsonPropertyName("created_at")] DateTimeOffset? CreatedAtUtc,
        JsonElement? Metadata);

    private static string? ReadString(JsonElement? metadata, string propertyName) =>
        metadata is { ValueKind: JsonValueKind.Object } value &&
        value.TryGetProperty(propertyName, out var property) && property.ValueKind == JsonValueKind.String
            ? property.GetString()
            : null;

    private static long ReadInt64(JsonElement? metadata, string propertyName)
    {
        if (metadata is not { ValueKind: JsonValueKind.Object } value ||
            !value.TryGetProperty(propertyName, out var property)) return 0;
        if (property.ValueKind == JsonValueKind.Number && property.TryGetInt64(out var number)) return number;
        return property.ValueKind == JsonValueKind.String && long.TryParse(property.GetString(), NumberStyles.None, CultureInfo.InvariantCulture, out number)
            ? number
            : 0;
    }
}
