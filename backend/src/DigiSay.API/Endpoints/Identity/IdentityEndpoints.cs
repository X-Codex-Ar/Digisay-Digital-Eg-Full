using Asp.Versioning.Builder;
using DigiSay.Infrastructure.Identity;
using DigiSay.API.RateLimiting;
using Microsoft.AspNetCore.Identity;

namespace DigiSay.API.Endpoints.Identity;

internal static class IdentityEndpoints
{
    public static void MapIdentityEndpoints(this RouteGroupBuilder versionedApi)
    {
        var auth = versionedApi.MapGroup("/auth")
            .WithTags("Identity")
            .WithMetadata(new RateLimitPolicy("identity-auth", 10, TimeSpan.FromMinutes(10)))
            .AddEndpointFilter<DistributedRateLimitFilter>();

        auth.MapIdentityApi<DigiSayUser>();
        auth.MapPost("/logout", async (SignInManager<DigiSayUser> signInManager) =>
            {
                await signInManager.SignOutAsync();
                return Results.NoContent();
            })
            .WithName("Logout")
            .WithSummary("Sign out and clear an Identity cookie session.")
            .RequireAuthorization();

        versionedApi.MapGet("/users/me", async (
                HttpContext httpContext,
                UserManager<DigiSayUser> userManager) =>
            {
                var user = await userManager.GetUserAsync(httpContext.User);
                if (user is null)
                {
                    return Results.Unauthorized();
                }

                var roles = await userManager.GetRolesAsync(user);
                return Results.Ok(new CurrentUserResponse(user.Id, user.Email!, user.DisplayName, roles.ToArray()));
            })
            .WithName("GetCurrentUser")
            .WithSummary("Return the signed-in user's profile and roles.")
            .WithTags("Identity")
            .RequireAuthorization();
    }
}

internal sealed record CurrentUserResponse(Guid Id, string Email, string? DisplayName, IReadOnlyList<string> Roles);
