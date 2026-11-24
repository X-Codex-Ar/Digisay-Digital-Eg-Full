using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using DigiSay.Domain.Entities.Organizations;
using DigiSay.Infrastructure.Identity;
using DigiSay.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace DigiSay.API.IntegrationTests;

public sealed class CrmLifecycleApiTests
{
    private const string Password = "G00d-Password!2026";

    [Fact]
    public async Task Lead_operations_enforce_lifecycle_and_record_actors()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var client = await CreateOrganizationClientAsync(factory, "sales@example.test", "Agency Alpha");

        using var invalidTransition = await client.PostAsJsonAsync(
            "/api/v1/crm/leads/00000000-0000-0000-0000-000000000001/transitions",
            new { status = "Converted" });
        Assert.Equal(HttpStatusCode.NotFound, invalidTransition.StatusCode);

        using var create = await client.PostAsJsonAsync("/api/v1/crm/leads", new
        {
            name = "  Ada Lovelace ",
            email = " ADA@EXAMPLE.TEST ",
            phone = "+1 555 0100",
            source = "Website",
        });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        using var created = await JsonDocument.ParseAsync(await create.Content.ReadAsStreamAsync());
        var id = created.RootElement.GetProperty("id").GetGuid();
        var actorId = created.RootElement.GetProperty("createdByUserId").GetGuid();
        Assert.Equal("ada@example.test", created.RootElement.GetProperty("email").GetString());
        Assert.Equal("New", created.RootElement.GetProperty("status").GetString());

        using var skippedState = await client.PostAsJsonAsync(
            $"/api/v1/crm/leads/{id}/transitions",
            new { status = "Qualified" });
        Assert.Equal(HttpStatusCode.Conflict, skippedState.StatusCode);

        foreach (var status in new[] { "Contacted", "Qualified", "Proposal", "Negotiation", "Converted" })
        {
            using var transition = await client.PostAsJsonAsync(
                $"/api/v1/crm/leads/{id}/transitions",
                new { status });
            Assert.Equal(HttpStatusCode.OK, transition.StatusCode);
        }

        using var update = await client.PutAsJsonAsync($"/api/v1/crm/leads/{id}", new
        {
            name = "Ada Byron",
            email = "ada.byron@example.test",
            phone = (string?)null,
            source = "Referral",
        });
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);
        using var updated = await JsonDocument.ParseAsync(await update.Content.ReadAsStreamAsync());
        Assert.Equal("Ada Byron", updated.RootElement.GetProperty("name").GetString());
        Assert.Equal("Converted", updated.RootElement.GetProperty("status").GetString());
        Assert.Equal(actorId, updated.RootElement.GetProperty("updatedByUserId").GetGuid());
        Assert.True(updated.RootElement.GetProperty("updatedAtUtc").GetDateTimeOffset() >=
            created.RootElement.GetProperty("createdAtUtc").GetDateTimeOffset());

        using var listResponse = await client.GetAsync("/api/v1/crm/leads?page=1&pageSize=5");
        var listBody = await listResponse.Content.ReadAsStringAsync();
        Assert.True(listResponse.StatusCode == HttpStatusCode.OK, $"{listBody}\n{string.Join(Environment.NewLine, factory.Logs)}");
        var leads = JsonSerializer.Deserialize<PagedResponse<LeadResponse>>(listBody, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        Assert.NotNull(leads);
        Assert.Equal(1, leads.TotalCount);
        Assert.Single(leads.Items);
    }

    [Fact]
    public async Task Service_requests_are_validated_and_follow_explicit_states()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var client = await CreateOrganizationClientAsync(factory, "client@example.test", "Northwind");

        using var invalid = await client.PostAsJsonAsync("/api/v1/crm/service-requests", new
        {
            title = "x",
            description = "",
            service = "",
        });
        Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);

        using var create = await client.PostAsJsonAsync("/api/v1/crm/service-requests", new
        {
            title = "Launch campaign",
            description = "Plan and deliver a product launch campaign.",
            service = "Marketing",
        });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        using var created = await JsonDocument.ParseAsync(await create.Content.ReadAsStreamAsync());
        var id = created.RootElement.GetProperty("id").GetGuid();

        using var skippedState = await client.PostAsJsonAsync(
            $"/api/v1/crm/service-requests/{id}/transitions",
            new { status = "Completed" });
        Assert.Equal(HttpStatusCode.Conflict, skippedState.StatusCode);

        foreach (var status in new[] { "UnderReview", "Approved", "InProgress", "Completed" })
        {
            using var transition = await client.PostAsJsonAsync(
                $"/api/v1/crm/service-requests/{id}/transitions",
                new { status });
            Assert.Equal(HttpStatusCode.OK, transition.StatusCode);
        }

        using var requestListResponse = await client.GetAsync("/api/v1/crm/service-requests?page=1&pageSize=20");
        var requestListBody = await requestListResponse.Content.ReadAsStringAsync();
        Assert.True(requestListResponse.StatusCode == HttpStatusCode.OK, requestListBody);
        var requests = JsonSerializer.Deserialize<PagedResponse<ServiceRequestResponse>>(requestListBody, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        Assert.NotNull(requests);
        Assert.Single(requests.Items);
        Assert.Equal("Completed", requests.Items[0].Status);
    }

    [Fact]
    public async Task Domain_validation_failures_are_returned_as_client_errors()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var client = await CreateOrganizationClientAsync(factory, "validation@example.test", "Validation Org");

        using var invalidLead = await client.PostAsJsonAsync("/api/v1/crm/leads", new
        {
            name = " A ",
            email = "valid@example.test",
        });
        using var invalidEmailLead = await client.PostAsJsonAsync("/api/v1/crm/leads", new
        {
            name = "Valid Name",
            email = "user@localhost",
        });
        using var invalidServiceRequest = await client.PostAsJsonAsync("/api/v1/crm/service-requests", new
        {
            title = " a ",
            description = "A valid service request description.",
            service = "Marketing",
        });

        Assert.Equal(HttpStatusCode.BadRequest, invalidLead.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, invalidEmailLead.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, invalidServiceRequest.StatusCode);
    }

    [Fact]
    public async Task CRM_reads_and_writes_are_isolated_between_organizations()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var firstClient = await CreateOrganizationClientAsync(factory, "first@example.test", "First Org");
        using var secondClient = await CreateOrganizationClientAsync(factory, "second@example.test", "Second Org");

        var firstOrganizationId = firstClient.DefaultRequestHeaders.GetValues("X-Organization-Id").Single();
        using var create = await firstClient.PostAsJsonAsync("/api/v1/crm/leads", new
        {
            name = "Grace Hopper",
            email = "grace@example.test",
            source = "Referral",
        });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        using var created = await JsonDocument.ParseAsync(await create.Content.ReadAsStreamAsync());
        var leadId = created.RootElement.GetProperty("id").GetGuid();

        secondClient.DefaultRequestHeaders.Remove("X-Organization-Id");
        var secondOrganizationId = await GetOrganizationIdAsync(secondClient);
        secondClient.DefaultRequestHeaders.Add("X-Organization-Id", secondOrganizationId.ToString());
        var crossOrganizationRead = await secondClient.GetAsync($"/api/v1/crm/leads/{leadId}");
        using var otherListResponse = await secondClient.GetAsync("/api/v1/crm/leads");
        var otherListBody = await otherListResponse.Content.ReadAsStringAsync();
        Assert.True(otherListResponse.StatusCode == HttpStatusCode.OK, otherListBody);
        var otherOrganizationLeads = JsonSerializer.Deserialize<PagedResponse<LeadResponse>>(otherListBody, new JsonSerializerOptions(JsonSerializerDefaults.Web));

        Assert.Equal(HttpStatusCode.NotFound, crossOrganizationRead.StatusCode);
        Assert.NotNull(otherOrganizationLeads);
        Assert.Empty(otherOrganizationLeads.Items);

        using var attemptRequest = new HttpRequestMessage(HttpMethod.Get, "/api/v1/organizations/current");
        attemptRequest.Headers.Add("X-Organization-Id", firstOrganizationId);
        using var attemptToSelectOtherOrganization = await secondClient.SendAsync(attemptRequest);
        Assert.Equal(HttpStatusCode.NotFound, attemptToSelectOtherOrganization.StatusCode);
    }

    [Fact]
    public async Task CRM_routes_reject_anonymous_requests_and_invalid_pagination()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var anonymous = factory.CreateClient();
        anonymous.DefaultRequestHeaders.Add("X-Organization-Id", Guid.NewGuid().ToString());
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync("/api/v1/crm/leads")).StatusCode);

        using var client = await CreateOrganizationClientAsync(factory, "pagination@example.test", "Pagination Org");
        var invalidPage = await client.GetAsync("/api/v1/crm/leads?page=0&pageSize=101");
        Assert.Equal(HttpStatusCode.BadRequest, invalidPage.StatusCode);
    }

    [Fact]
    public async Task Clients_can_submit_and_track_only_requests_in_their_organization()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var client = await CreateOrganizationClientAsync(factory, "portal@example.test", "Portal Org", DigiSayRoles.Client);
        using var otherClient = await CreateOrganizationClientAsync(factory, "other-portal@example.test", "Other Portal Org", DigiSayRoles.Client);

        using var submit = await client.PostAsJsonAsync("/api/v1/crm/service-requests", new
        {
            title = "Campaign planning",
            description = "Please help plan our next campaign.",
            service = "Marketing",
        });
        Assert.Equal(HttpStatusCode.Created, submit.StatusCode);

        using var created = await JsonDocument.ParseAsync(await submit.Content.ReadAsStreamAsync());
        var requestId = created.RootElement.GetProperty("id").GetGuid();

        using var ownHistory = await client.GetAsync("/api/v1/crm/service-requests");
        Assert.Equal(HttpStatusCode.OK, ownHistory.StatusCode);
        var ownPage = await ownHistory.Content.ReadFromJsonAsync<PagedResponse<ServiceRequestResponse>>();
        Assert.NotNull(ownPage);
        Assert.Single(ownPage.Items);

        using var ownDetails = await client.GetAsync($"/api/v1/crm/service-requests/{requestId}");
        Assert.Equal(HttpStatusCode.OK, ownDetails.StatusCode);

        using var otherHistory = await otherClient.GetAsync("/api/v1/crm/service-requests");
        Assert.Equal(HttpStatusCode.OK, otherHistory.StatusCode);
        var otherPage = await otherHistory.Content.ReadFromJsonAsync<PagedResponse<ServiceRequestResponse>>();
        Assert.NotNull(otherPage);
        Assert.Empty(otherPage.Items);

        using var crossOrganizationDetails = await otherClient.GetAsync($"/api/v1/crm/service-requests/{requestId}");
        Assert.Equal(HttpStatusCode.NotFound, crossOrganizationDetails.StatusCode);

        using var transition = await client.PostAsJsonAsync($"/api/v1/crm/service-requests/{requestId}/transitions", new { status = "UnderReview" });
        Assert.Equal(HttpStatusCode.Forbidden, transition.StatusCode);

        using var leadAccess = await client.GetAsync("/api/v1/crm/leads");
        Assert.Equal(HttpStatusCode.Forbidden, leadAccess.StatusCode);
    }

    private static async Task<HttpClient> CreateOrganizationClientAsync(
        DigiSayApiFactory factory,
        string email,
        string organizationName,
        string role = DigiSayRoles.Admin)
    {
        var client = factory.CreateClient();
        var token = await RegisterAndSignInAsync(factory, client, email, role);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        using var response = await client.PostAsJsonAsync("/api/v1/organizations", new { name = organizationName });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        using var document = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
        client.DefaultRequestHeaders.Add("X-Organization-Id", document.RootElement.GetProperty("id").GetGuid().ToString());
        return client;
    }

    private static async Task<Guid> GetOrganizationIdAsync(HttpClient client)
    {
        var organizations = await client.GetFromJsonAsync<OrganizationResponse[]>("/api/v1/organizations");
        return Assert.Single(organizations!).Id;
    }

    private static async Task<string> RegisterAndSignInAsync(DigiSayApiFactory factory, HttpClient client, string email, string role)
    {
        var registration = await client.PostAsJsonAsync("/api/v1/auth/register", new { email, password = Password });
        Assert.Equal(HttpStatusCode.OK, registration.StatusCode);
        using var confirmation = await factory.ConfirmEmailAsync(client, email);
        Assert.Equal(HttpStatusCode.OK, confirmation.StatusCode);

        using (var scope = factory.Services.CreateScope())
        {
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<DigiSayUser>>();
            var user = await userManager.FindByEmailAsync(email);
            Assert.NotNull(user);
            var roleResult = await userManager.AddToRoleAsync(user!, role);
            Assert.True(roleResult.Succeeded, string.Join("; ", roleResult.Errors.Select(error => error.Description)));
        }

        var login = await client.PostAsJsonAsync("/api/v1/auth/login?useCookies=false", new { email, password = Password });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        using var document = await JsonDocument.ParseAsync(await login.Content.ReadAsStreamAsync());
        return document.RootElement.GetProperty("accessToken").GetString()!;
    }

    private sealed record OrganizationResponse(Guid Id, string Name, string MembershipRole);
    private sealed record LeadResponse(Guid Id, string Name, string Email, string? Phone, string? Source, string Status, Guid CreatedByUserId, Guid UpdatedByUserId, DateTimeOffset CreatedAtUtc, DateTimeOffset UpdatedAtUtc);
    private sealed record ServiceRequestResponse(Guid Id, string Title, string Description, string Service, string Status, Guid CreatedByUserId, Guid UpdatedByUserId, DateTimeOffset CreatedAtUtc, DateTimeOffset UpdatedAtUtc);
    private sealed record PagedResponse<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount, int TotalPages);

}
