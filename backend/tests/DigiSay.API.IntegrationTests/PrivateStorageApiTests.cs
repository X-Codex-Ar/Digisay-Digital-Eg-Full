using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Xunit;

namespace DigiSay.API.IntegrationTests;

public sealed class PrivateStorageApiTests
{
    private const string Password = "G00d-Password!2026";

    [Fact]
    public async Task Owner_uploads_signature_validated_file_and_download_link_expires_quickly()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var client = await CreateOrganizationClientAsync(factory, "media-owner@example.test", "Media Org");
        var organizationId = Guid.Parse(client.DefaultRequestHeaders.GetValues("X-Organization-Id").Single());
        var before = DateTimeOffset.UtcNow;
        using var multipart = CreateMultipart("%PDF-1.7\nvalid", "text/plain", "../../untrusted-name.txt");

        using var upload = await client.PostAsync("/api/v1/storage/objects", multipart);
        var uploadBody = await upload.Content.ReadAsStringAsync();
        Assert.True(upload.StatusCode == HttpStatusCode.Created, uploadBody);
        using var uploaded = JsonDocument.Parse(uploadBody);
        var objectId = uploaded.RootElement.GetProperty("id").GetGuid();
        Assert.Equal("application/pdf", uploaded.RootElement.GetProperty("contentType").GetString());
        Assert.Equal(new[] { organizationId }, factory.Storage.OrganizationIds);

        using var listResponse = await client.GetAsync("/api/v1/storage/objects");
        Assert.Equal(HttpStatusCode.OK, listResponse.StatusCode);
        var listedObjects = await listResponse.Content.ReadFromJsonAsync<StorageObjectResponse[]>();
        Assert.NotNull(listedObjects);
        Assert.Contains(listedObjects, item => item.Id == objectId);

        using var linkResponse = await client.PostAsync($"/api/v1/storage/objects/{objectId}/download-link", null);
        Assert.Equal(HttpStatusCode.OK, linkResponse.StatusCode);
        using var link = await JsonDocument.ParseAsync(await linkResponse.Content.ReadAsStreamAsync());
        var expiry = link.RootElement.GetProperty("expiresAtUtc").GetDateTimeOffset();
        Assert.InRange(expiry, before.AddMinutes(5), DateTimeOffset.UtcNow.AddMinutes(5));
        Assert.Contains("download=true", link.RootElement.GetProperty("url").GetString());

        factory.Storage.ProviderFailureStatusCode = StatusCodes.Status400BadRequest;
        using var badDownload = await client.PostAsync($"/api/v1/storage/objects/{objectId}/download-link", null);
        using var badDelete = await client.DeleteAsync($"/api/v1/storage/objects/{objectId}");
        Assert.Equal(HttpStatusCode.BadGateway, badDownload.StatusCode);
        Assert.Equal(HttpStatusCode.BadGateway, badDelete.StatusCode);
    }

    [Fact]
    public async Task Storage_rejects_anonymous_requests_invalid_file_signatures_and_cross_tenant_object_access()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var anonymous = factory.CreateClient();
        using var anonymousLink = await anonymous.PostAsync($"/api/v1/storage/objects/{Guid.NewGuid()}/download-link", null);
        Assert.Equal(HttpStatusCode.Unauthorized, anonymousLink.StatusCode);

        using var owner = await CreateOrganizationClientAsync(factory, "storage-a@example.test", "Storage A");
        using var outsider = await CreateOrganizationClientAsync(factory, "storage-b@example.test", "Storage B");
        using var invalidMultipart = CreateMultipart("this is plain text", "application/pdf", "document.pdf");
        using var invalidUpload = await owner.PostAsync("/api/v1/storage/objects", invalidMultipart);
        Assert.Equal(HttpStatusCode.BadRequest, invalidUpload.StatusCode);

        using var validMultipart = CreateMultipart("%PDF-1.7\nvalid", "application/octet-stream", "document.pdf");
        using var upload = await owner.PostAsync("/api/v1/storage/objects", validMultipart);
        Assert.Equal(HttpStatusCode.Created, upload.StatusCode);
        var objectId = (await upload.Content.ReadFromJsonAsync<StorageObjectResponse>())!.Id;

        using var crossTenantLink = await outsider.PostAsync($"/api/v1/storage/objects/{objectId}/download-link", null);
        using var crossTenantDelete = await outsider.DeleteAsync($"/api/v1/storage/objects/{objectId}");
        using var crossTenantList = await outsider.GetAsync("/api/v1/storage/objects");
        Assert.Equal(HttpStatusCode.NotFound, crossTenantLink.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, crossTenantDelete.StatusCode);
        Assert.Equal(HttpStatusCode.OK, crossTenantList.StatusCode);
        Assert.Empty(await crossTenantList.Content.ReadFromJsonAsync<StorageObjectResponse[]>() ?? []);
        using var crossTenantMetadata = await outsider.GetAsync($"/api/v1/storage/objects/{objectId}");
        Assert.Equal(HttpStatusCode.NotFound, crossTenantMetadata.StatusCode);
        Assert.Single(factory.Storage.OrganizationIds);
    }

    [Fact]
    public async Task Metadata_is_persisted_resolvable_and_removed_only_after_the_provider_delete_succeeds()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var client = await CreateOrganizationClientAsync(factory, "metadata-owner@example.test", "Metadata Org");
        using var multipart = CreateMultipart("%PDF-1.7\nvalid", "application/pdf", "document.pdf");

        using var upload = await client.PostAsync("/api/v1/storage/objects", multipart);
        Assert.Equal(HttpStatusCode.Created, upload.StatusCode);
        var objectId = (await upload.Content.ReadFromJsonAsync<StorageObjectResponse>())!.Id;
        Assert.Equal($"/api/v1/storage/objects/{objectId}", upload.Headers.Location?.OriginalString);

        using var metadata = await client.GetAsync(upload.Headers.Location);
        Assert.Equal(HttpStatusCode.OK, metadata.StatusCode);
        Assert.Equal(objectId, (await metadata.Content.ReadFromJsonAsync<StorageObjectResponse>())!.Id);

        factory.Storage.ProviderFailureStatusCode = StatusCodes.Status400BadRequest;
        using var failedDelete = await client.DeleteAsync($"/api/v1/storage/objects/{objectId}");
        Assert.Equal(HttpStatusCode.BadGateway, failedDelete.StatusCode);
        factory.Storage.ProviderFailureStatusCode = null;
        using var stillThere = await client.GetAsync($"/api/v1/storage/objects/{objectId}");
        Assert.Equal(HttpStatusCode.OK, stillThere.StatusCode);

        using var delete = await client.DeleteAsync($"/api/v1/storage/objects/{objectId}");
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);
        using var gone = await client.GetAsync($"/api/v1/storage/objects/{objectId}");
        using var unknownLink = await client.PostAsync($"/api/v1/storage/objects/{Guid.NewGuid()}/download-link", null);
        Assert.Equal(HttpStatusCode.NotFound, gone.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, unknownLink.StatusCode);
    }

    private static MultipartFormDataContent CreateMultipart(string content, string claimedType, string fileName)
    {
        var multipart = new MultipartFormDataContent();
        var bytes = new ByteArrayContent(System.Text.Encoding.UTF8.GetBytes(content));
        bytes.Headers.ContentType = new MediaTypeHeaderValue(claimedType);
        multipart.Add(bytes, "file", fileName);
        return multipart;
    }

    private static async Task<HttpClient> CreateOrganizationClientAsync(DigiSayApiFactory factory, string email, string organizationName)
    {
        var client = factory.CreateClient();
        using var registration = await client.PostAsJsonAsync("/api/v1/auth/register", new { email, password = Password });
        Assert.Equal(HttpStatusCode.OK, registration.StatusCode);
        using var confirmation = await factory.ConfirmEmailAsync(client, email);
        Assert.Equal(HttpStatusCode.OK, confirmation.StatusCode);
        using var login = await client.PostAsJsonAsync("/api/v1/auth/login?useCookies=false", new { email, password = Password });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        using var loginJson = await JsonDocument.ParseAsync(await login.Content.ReadAsStreamAsync());
        var token = loginJson.RootElement.GetProperty("accessToken").GetString()!;
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        using var createOrganization = await client.PostAsJsonAsync("/api/v1/organizations", new { name = organizationName });
        Assert.Equal(HttpStatusCode.Created, createOrganization.StatusCode);
        using var organizationJson = await JsonDocument.ParseAsync(await createOrganization.Content.ReadAsStreamAsync());
        client.DefaultRequestHeaders.Add("X-Organization-Id", organizationJson.RootElement.GetProperty("id").GetGuid().ToString());
        return client;
    }

    private sealed record StorageObjectResponse(Guid Id);
}
