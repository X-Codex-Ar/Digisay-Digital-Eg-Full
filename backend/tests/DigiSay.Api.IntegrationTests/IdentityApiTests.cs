using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace DigiSay.Api.IntegrationTests;

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

        Assert.Equal(
            "Server=localhost;Database=DigiSayTests;User Id=test;Password=test;TrustServerCertificate=True",
            connectionString);
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

        var refreshed = await client.PostAsJsonAsync("/api/v1/auth/refresh", new { refreshToken });
        Assert.Equal(HttpStatusCode.OK, refreshed.StatusCode);
        using var refreshedResponse = await JsonDocument.ParseAsync(await refreshed.Content.ReadAsStreamAsync());
        accessToken = refreshedResponse.RootElement.GetProperty("accessToken").GetString();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var profile = await client.GetFromJsonAsync<ProfileResponse>("/api/v1/users/me");

        Assert.NotNull(profile);
        Assert.Equal(Email, profile.Email);
        Assert.Empty(profile.Roles);
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
}
