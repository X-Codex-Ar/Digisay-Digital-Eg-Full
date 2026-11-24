using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace DigiSay.Api.IntegrationTests;

public sealed class OrganizationApiTests
{
    private const string Password = "G00d-Password!2026";

    [Fact]
    public async Task Organization_endpoints_require_authentication()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/v1/organizations", new { name = "DigiSay" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Organization_creator_receives_owner_membership_and_lists_only_their_organizations()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var firstClient = factory.CreateClient();
        using var secondClient = factory.CreateClient();
        firstClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", await RegisterAndSignInAsync(factory, firstClient, "owner@example.test"));
        secondClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", await RegisterAndSignInAsync(factory, secondClient, "other@example.test"));

        using var createResponse = await firstClient.PostAsJsonAsync("/api/v1/organizations", new { name = "  DigiSay Client  " });
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        using var createdDocument = await JsonDocument.ParseAsync(await createResponse.Content.ReadAsStreamAsync());
        var organizationId = createdDocument.RootElement.GetProperty("id").GetGuid();
        Assert.Equal("DigiSay Client", createdDocument.RootElement.GetProperty("name").GetString());
        Assert.Equal("Owner", createdDocument.RootElement.GetProperty("membershipRole").GetString());

        var ownerOrganizations = await firstClient.GetFromJsonAsync<OrganizationResponse[]>("/api/v1/organizations");
        var otherOrganizations = await secondClient.GetFromJsonAsync<OrganizationResponse[]>("/api/v1/organizations");

        Assert.Contains(ownerOrganizations!, organization => organization.Id == organizationId);
        Assert.Empty(otherOrganizations!);
    }

    [Fact]
    public async Task Organization_header_selects_scope_only_after_active_membership_is_verified()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var ownerClient = factory.CreateClient();
        using var nonMemberClient = factory.CreateClient();
        ownerClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", await RegisterAndSignInAsync(factory, ownerClient, "owner@example.test"));
        nonMemberClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", await RegisterAndSignInAsync(factory, nonMemberClient, "outsider@example.test"));

        using var createResponse = await ownerClient.PostAsJsonAsync("/api/v1/organizations", new { name = "Northwind" });
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        using var createdDocument = await JsonDocument.ParseAsync(await createResponse.Content.ReadAsStreamAsync());
        var organizationId = createdDocument.RootElement.GetProperty("id").GetGuid();

        var missingSelection = await ownerClient.GetAsync("/api/v1/organizations/current");
        ownerClient.DefaultRequestHeaders.Add("X-Organization-Id", organizationId.ToString());
        var verifiedOwnerScope = await ownerClient.GetFromJsonAsync<OrganizationResponse>("/api/v1/organizations/current");
        nonMemberClient.DefaultRequestHeaders.Add("X-Organization-Id", organizationId.ToString());
        var unverifiedOtherScope = await nonMemberClient.GetAsync("/api/v1/organizations/current");

        Assert.Equal(HttpStatusCode.BadRequest, missingSelection.StatusCode);
        Assert.Equal(organizationId, verifiedOwnerScope!.Id);
        Assert.Equal("Owner", verifiedOwnerScope.MembershipRole);
        Assert.Equal(HttpStatusCode.NotFound, unverifiedOtherScope.StatusCode);
    }

    private static async Task<string> RegisterAndSignInAsync(
        DigiSayApiFactory factory,
        HttpClient client,
        string email)
    {
        var registration = await client.PostAsJsonAsync("/api/v1/auth/register", new
        {
            email,
            password = Password,
        });
        Assert.Equal(HttpStatusCode.OK, registration.StatusCode);
        await factory.ConfirmEmailAsync(email);

        var login = await client.PostAsJsonAsync("/api/v1/auth/login?useCookies=false", new
        {
            email,
            password = Password,
        });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        using var document = await JsonDocument.ParseAsync(await login.Content.ReadAsStreamAsync());
        return document.RootElement.GetProperty("accessToken").GetString()!;
    }

    private sealed record OrganizationResponse(Guid Id, string Name, string MembershipRole);
}
