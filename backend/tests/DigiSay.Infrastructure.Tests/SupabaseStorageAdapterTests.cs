using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using DigiSay.Application.Features.Content;
using DigiSay.Infrastructure.Storage.Supabase;
using Microsoft.Extensions.Options;
using Xunit;

namespace DigiSay.Infrastructure.Tests;

public sealed class SupabaseStorageAdapterTests
{
    [Fact]
    public async Task Upload_sign_and_delete_use_backend_credentials_and_organization_scoped_keys()
    {
        var requests = new List<CapturedRequest>();
        var organizationId = Guid.NewGuid();
        var objectId = Guid.NewGuid();
        var handler = new RecordingHandler(async (request, _) =>
        {
            requests.Add(await CaptureRequestMetadataAsync(request));
            var response = new HttpResponseMessage(HttpStatusCode.OK);
            if (request.RequestUri!.AbsolutePath.Contains("/sign/", StringComparison.Ordinal))
            {
                response.Content = JsonContent.Create(new
                {
                    signedURL = $"/object/sign/digisay-private/organizations/{organizationId:N}/{objectId:N}?token=stub",
                });
            }

            return response;
        });
        var client = new HttpClient(handler) { BaseAddress = new Uri("https://project.supabase.test/storage/v1/") };
        var adapter = new SupabaseStorageAdapter(client, Options.Create(new SupabaseStorageOptions
        {
            ProjectUrl = "https://project.supabase.test",
            SecretKey = "server-only-secret",
            PrivateBucket = "digisay-private",
        }));

        await adapter.UploadAsync(organizationId, objectId, new MemoryStream([1, 2, 3]), "image/png", CancellationToken.None);
        var signedUrl = await adapter.CreateSignedDownloadUrlAsync(organizationId, objectId, TimeSpan.FromMinutes(5), CancellationToken.None);
        await adapter.DeleteAsync(organizationId, objectId, CancellationToken.None);

        Assert.Equal(3, requests.Count);
        Assert.All(requests, request =>
        {
            Assert.Equal("Bearer server-only-secret", request.Authorization);
            Assert.Equal("server-only-secret", request.ApiKey);
        });
        var objectPath = $"organizations/{organizationId:N}/{objectId:N}";
        Assert.Contains(objectPath, requests[0].Path);
        Assert.Contains(objectPath, requests[1].Path);
        Assert.Contains(objectPath, requests[2].Body);
        Assert.Equal("image/png", requests[0].ContentType);
        Assert.Equal("false", requests[0].Upsert);
        using var signBody = JsonDocument.Parse(requests[1].Body);
        Assert.Equal(300, signBody.RootElement.GetProperty("expiresIn").GetInt32());
        using var deleteBody = JsonDocument.Parse(requests[2].Body);
        Assert.Equal(objectPath, deleteBody.RootElement.GetProperty("prefixes")[0].GetString());
        Assert.Contains("download=true", signedUrl.Query);
        Assert.Equal("https://project.supabase.test/storage/v1/object/sign/digisay-private/organizations/" +
            $"{organizationId:N}/{objectId:N}?token=stub&download=true", signedUrl.AbsoluteUri);
        Assert.Equal(HttpMethod.Delete, requests[2].Method);
    }

    [Fact]
    public async Task Provider_errors_are_sanitized_and_expiry_is_bounded()
    {
        var failingHandler = new RecordingHandler((_, _) => Task.FromResult(new HttpResponseMessage(HttpStatusCode.InternalServerError)
        {
            Content = new StringContent("secret provider diagnostic"),
        }));
        var adapter = CreateAdapter(failingHandler);

        var failure = await Assert.ThrowsAsync<StorageProviderException>(() => adapter.DeleteAsync(
            Guid.NewGuid(), Guid.NewGuid(), CancellationToken.None));
        Assert.Equal((int)HttpStatusCode.InternalServerError, failure.StatusCode);
        Assert.DoesNotContain("secret provider diagnostic", failure.Message);
        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() => adapter.CreateSignedDownloadUrlAsync(
            Guid.NewGuid(), Guid.NewGuid(), TimeSpan.FromHours(2), CancellationToken.None));
    }

    [Fact]
    public async Task Adapter_rejects_signed_urls_outside_the_configured_project()
    {
        var handler = new RecordingHandler((_, _) => Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = JsonContent.Create(new { signedURL = "https://attacker.invalid/steal?token=x" }),
        }));
        var adapter = CreateAdapter(handler);

        var exception = await Assert.ThrowsAsync<StorageProviderException>(() => adapter.CreateSignedDownloadUrlAsync(
            Guid.NewGuid(), Guid.NewGuid(), TimeSpan.FromMinutes(1), CancellationToken.None));
        Assert.Contains("outside the configured project", exception.Message);
    }

    private static SupabaseStorageAdapter CreateAdapter(HttpMessageHandler handler) =>
        new(new HttpClient(handler) { BaseAddress = new Uri("https://project.supabase.test/storage/v1/") },
            Options.Create(new SupabaseStorageOptions
            {
                ProjectUrl = "https://project.supabase.test",
                SecretKey = "server-only-secret",
                PrivateBucket = "digisay-private",
            }));

    private static async Task<CapturedRequest> CaptureRequestMetadataAsync(HttpRequestMessage request)
    {
        var contentType = request.Content?.Headers.ContentType?.MediaType;
        var body = request.Content is null ? string.Empty : await request.Content.ReadAsStringAsync();
        request.Headers.TryGetValues("apikey", out var apiKeys);
        request.Headers.TryGetValues("x-upsert", out var upsert);
        return new CapturedRequest(
            request.Method,
            request.RequestUri!.AbsolutePath,
            request.Headers.Authorization?.ToString() ?? string.Empty,
            apiKeys?.SingleOrDefault() ?? string.Empty,
            contentType,
            upsert?.SingleOrDefault(),
            body);
    }

    private sealed record CapturedRequest(HttpMethod Method, string Path, string Authorization, string ApiKey, string? ContentType, string? Upsert, string Body);

    private sealed class RecordingHandler(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> send)
        : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) =>
            send(request, cancellationToken);
    }
}
