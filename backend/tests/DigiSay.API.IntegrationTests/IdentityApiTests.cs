using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using DigiSay.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace DigiSay.API.IntegrationTests;

public sealed class IdentityApiTests
{
    private const string Email = "identity@example.test";
    private const string Password = "G00d-Password!2026";

    [Fact]
    public void Test_host_uses_the_isolated_sql_server_connection_setting()
    {
        using var factory = new DigiSayApiFactory();

        var connectionString = factory.Services.GetRequiredService<IConfiguration>()
            .GetConnectionString("SqlServer");

        Assert.Equal(factory.TestConnectionString, connectionString);
    }

    [Fact]
    public async Task Protected_profile_rejects_anonymous_requests()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/v1/users/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Confirmed_account_can_sign_in_and_read_its_profile()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var client = factory.CreateClient();

        var registration = await client.PostAsJsonAsync("/api/v1/auth/register", new
        {
            email = Email,
            password = Password,
        });
        Assert.Equal(HttpStatusCode.OK, registration.StatusCode);
        var confirmation = await factory.ConfirmEmailAsync(client, Email);
        Assert.Equal(HttpStatusCode.OK, confirmation.StatusCode);

        var login = await client.PostAsJsonAsync("/api/v1/auth/login?useCookies=false", new
        {
            email = Email,
            password = Password,
        });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);

        using var tokenResponse = await JsonDocument.ParseAsync(await login.Content.ReadAsStreamAsync());
        var accessToken = tokenResponse.RootElement.GetProperty("accessToken").GetString();
        var refreshToken = tokenResponse.RootElement.GetProperty("refreshToken").GetString();
        Assert.False(string.IsNullOrWhiteSpace(accessToken));
        Assert.False(string.IsNullOrWhiteSpace(refreshToken));

        var refreshed = await client.PostAsJsonAsync("/api/v1/auth/refresh/", new { refreshToken });
        Assert.Equal(HttpStatusCode.OK, refreshed.StatusCode);
        using var refreshedResponse = await JsonDocument.ParseAsync(await refreshed.Content.ReadAsStreamAsync());
        accessToken = refreshedResponse.RootElement.GetProperty("accessToken").GetString();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var profile = await client.GetFromJsonAsync<ProfileResponse>("/api/v1/users/me");

        Assert.NotNull(profile);
        Assert.Equal(Email, profile.Email);
        Assert.Empty(profile.Roles);

        var replay = await client.PostAsJsonAsync("/api/v1/auth/refresh", new { refreshToken });
        Assert.Equal(HttpStatusCode.Unauthorized, replay.StatusCode);
    }

    [Fact]
    public async Task First_super_admin_bootstrap_is_secret_protected_and_role_admin_can_manage_accounts()
    {
        const string bootstrapEmail = "bootstrap-admin@example.test";
        const string targetEmail = "client-user@example.test";
        const string bootstrapSecret = "test-only-bootstrap-secret-32-bytes-long";
        using var factory = new DigiSayApiFactory(identityBootstrapSecret: bootstrapSecret);
        await factory.InitializeDatabaseAsync();
        using var client = factory.CreateClient();

        await RegisterAndConfirmAsync(factory, client, bootstrapEmail);
        var bootstrapToken = await SignInForAccessTokenAsync(client, bootstrapEmail);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bootstrapToken);

        var invalidBootstrap = await client.PostAsJsonAsync("/api/v1/auth/bootstrap-admin", new { secret = "wrong-secret" });
        Assert.Equal(HttpStatusCode.Unauthorized, invalidBootstrap.StatusCode);
        var bootstrap = await client.PostAsJsonAsync("/api/v1/auth/bootstrap-admin", new { secret = bootstrapSecret });
        Assert.Equal(HttpStatusCode.NoContent, bootstrap.StatusCode);

        var refreshedBootstrap = await SignInForAccessTokenAsync(client, bootstrapEmail);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", refreshedBootstrap);
        await RegisterAndConfirmAsync(factory, client, targetEmail);

        var listedUsers = await client.GetFromJsonAsync<JsonDocument>("/api/v1/admin/users?search=client-user");
        Assert.NotNull(listedUsers);
        Assert.Contains(targetEmail, listedUsers.RootElement.GetProperty("users").EnumerateArray()
            .Select(user => user.GetProperty("email").GetString()));

        using var scope = factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<DigiSayUser>>();
        var target = await userManager.FindByEmailAsync(targetEmail);
        Assert.NotNull(target);

        var roleUpdate = await client.PutAsJsonAsync($"/api/v1/admin/users/{target.Id}/roles", new { roles = new[] { DigiSayRoles.Client } });
        Assert.Equal(HttpStatusCode.OK, roleUpdate.StatusCode);

        var lastSuperAdminRemoval = await client.PutAsJsonAsync($"/api/v1/admin/users/{(await userManager.FindByEmailAsync(bootstrapEmail))!.Id}/roles", new { roles = Array.Empty<string>() });
        Assert.Equal(HttpStatusCode.Conflict, lastSuperAdminRemoval.StatusCode);

        var targetToken = await SignInForAccessTokenAsync(client, targetEmail);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", targetToken);
        var profile = await client.GetFromJsonAsync<ProfileResponse>("/api/v1/users/me");
        Assert.NotNull(profile);
        Assert.Equal(new[] { DigiSayRoles.Client }, profile.Roles);

        var unauthorizedRoleUpdate = await client.PutAsJsonAsync(
            $"/api/v1/admin/users/{target.Id}/roles", new { roles = new[] { DigiSayRoles.SuperAdmin } });
        Assert.Equal(HttpStatusCode.Forbidden, unauthorizedRoleUpdate.StatusCode);
    }

    [Fact]
    public async Task User_session_revocation_invalidates_refresh_tokens()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var client = factory.CreateClient();
        await RegisterAndConfirmAsync(factory, client, Email);
        var login = await LoginAsync(client, Email);
        var accessToken = login.RootElement.GetProperty("accessToken").GetString();
        var refreshToken = login.RootElement.GetProperty("refreshToken").GetString();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var revoke = await client.PostAsync("/api/v1/auth/sessions/revoke", content: null);
        Assert.Equal(HttpStatusCode.NoContent, revoke.StatusCode);
        var refresh = await client.PostAsJsonAsync("/api/v1/auth/refresh", new { refreshToken });
        Assert.Equal(HttpStatusCode.Unauthorized, refresh.StatusCode);
    }

    [Fact]
    public async Task Concurrent_refresh_replay_allows_only_one_rotation()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var client = factory.CreateClient();
        await RegisterAndConfirmAsync(factory, client, Email);
        using var login = await LoginAsync(client, Email);
        var refreshToken = login.RootElement.GetProperty("refreshToken").GetString();

        var refreshResponses = await Task.WhenAll(
            client.PostAsJsonAsync("/api/v1/auth/refresh", new { refreshToken }),
            client.PostAsJsonAsync("/api/v1/auth/refresh", new { refreshToken }));
        try
        {
            Assert.Single(refreshResponses, response => response.StatusCode == HttpStatusCode.OK);
            Assert.Single(refreshResponses, response => response.StatusCode == HttpStatusCode.Unauthorized);
        }
        finally
        {
            foreach (var response in refreshResponses)
            {
                response.Dispose();
            }
        }
    }

    [Fact]
    public async Task Identity_roles_are_persisted_and_invalid_password_is_rejected()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var client = factory.CreateClient();

        using var scope = factory.Services.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<Microsoft.AspNetCore.Identity.RoleManager<Microsoft.AspNetCore.Identity.IdentityRole<Guid>>>();
        Assert.NotNull(await roleManager.FindByNameAsync("SuperAdmin"));
        Assert.NotNull(await roleManager.FindByNameAsync("Client"));

        var registration = await client.PostAsJsonAsync("/api/v1/auth/register", new
        {
            email = Email,
            password = Password,
        });
        Assert.Equal(HttpStatusCode.OK, registration.StatusCode);
        var confirmation = await factory.ConfirmEmailAsync(client, Email);
        Assert.Equal(HttpStatusCode.OK, confirmation.StatusCode);

        var login = await client.PostAsJsonAsync("/api/v1/auth/login?useCookies=false", new
        {
            email = Email,
            password = "Wrong-Password!2026",
        });

        Assert.Equal(HttpStatusCode.Unauthorized, login.StatusCode);
    }

    [Fact]
    public async Task Cookie_session_logout_clears_the_authenticated_session()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var client = factory.CreateClient();

        var registration = await client.PostAsJsonAsync("/api/v1/auth/register", new
        {
            email = Email,
            password = Password,
        });
        Assert.Equal(HttpStatusCode.OK, registration.StatusCode);
        var confirmation = await factory.ConfirmEmailAsync(client, Email);
        Assert.Equal(HttpStatusCode.OK, confirmation.StatusCode);

        var login = await client.PostAsJsonAsync("/api/v1/auth/login?useCookies=true", new
        {
            email = Email,
            password = Password,
        });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        var setCookie = Assert.Single(login.Headers.GetValues("Set-Cookie"));
        Assert.Contains("httponly", setCookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("samesite=strict", setCookie, StringComparison.OrdinalIgnoreCase);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/v1/users/me")).StatusCode);

        var logout = await client.PostAsync("/api/v1/auth/logout", content: null);

        Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/users/me")).StatusCode);
    }

    [Fact]
    public async Task Credential_attempt_limits_are_separate_from_refresh_traffic()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var client = factory.CreateClient();

        for (var attempt = 0; attempt < 11; attempt++)
        {
            using var loginResponse = await client.PostAsJsonAsync("/api/v1/auth/login?useCookies=false", new
            {
                email = "unknown@example.test",
                password = Password,
            });

            if (attempt < 10)
            {
                Assert.NotEqual(HttpStatusCode.TooManyRequests, loginResponse.StatusCode);
            }
            else
            {
                Assert.Equal(HttpStatusCode.TooManyRequests, loginResponse.StatusCode);
            }
        }

        for (var attempt = 0; attempt < 11; attempt++)
        {
            using var refreshResponse = await client.PostAsJsonAsync("/api/v1/auth/refresh", new
            {
                refreshToken = "invalid-test-token",
            });

            Assert.NotEqual(HttpStatusCode.TooManyRequests, refreshResponse.StatusCode);
        }
    }

    private sealed record ProfileResponse(Guid Id, string Email, string? DisplayName, string[] Roles);

    private static async Task RegisterAndConfirmAsync(DigiSayApiFactory factory, HttpClient client, string email)
    {
        var registration = await client.PostAsJsonAsync("/api/v1/auth/register", new { email, password = Password });
        Assert.Equal(HttpStatusCode.OK, registration.StatusCode);
        await factory.ConfirmEmailAsync(client, email);
    }

    private static async Task<string> SignInForAccessTokenAsync(HttpClient client, string email)
    {
        using var response = await LoginAsync(client, email);
        return response.RootElement.GetProperty("accessToken").GetString()!;
    }

    private static async Task<JsonDocument> LoginAsync(HttpClient client, string email)
    {
        var login = await client.PostAsJsonAsync("/api/v1/auth/login?useCookies=false", new { email, password = Password });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        return await JsonDocument.ParseAsync(await login.Content.ReadAsStreamAsync());
    }
}
