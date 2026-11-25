using Asp.Versioning.Builder;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using DigiSay.API.Authentication;
using DigiSay.Infrastructure.Persistence;
using DigiSay.Domain.Enums;
using DigiSay.Infrastructure.Identity;
using DigiSay.API.RateLimiting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

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

        auth.MapPost("/sessions/revoke", async (
                ClaimsPrincipal principal,
                UserManager<DigiSayUser> userManager,
                SignInManager<DigiSayUser> signInManager) =>
            {
                var user = await userManager.GetUserAsync(principal);
                if (user is null)
                {
                    return Results.Unauthorized();
                }

                var result = await userManager.UpdateSecurityStampAsync(user);
                if (!result.Succeeded)
                {
                    return Results.Problem(statusCode: StatusCodes.Status409Conflict, title: "The session could not be revoked.");
                }

                await signInManager.SignOutAsync();
                return Results.NoContent();
            })
            .WithName("RevokeOwnSessions")
            .WithSummary("Revoke refresh and cookie sessions for the current account.")
            .RequireAuthorization();

        auth.MapPost("/bootstrap-admin", BootstrapAdminAsync)
            .WithName("BootstrapSuperAdmin")
            .WithSummary("Grant the first SuperAdmin role using a one-time deployment secret.")
            .RequireAuthorization();

        var adminUsers = versionedApi.MapGroup("/admin/users")
            .WithTags("Identity administration")
            .RequireAuthorization("SuperAdminAccess");

        adminUsers.MapGet("", ListUsersAsync)
            .WithName("ListIdentityUsers")
            .WithSummary("List user accounts for SuperAdmin role and session administration.");

        adminUsers.MapPut("/{userId:guid}/roles", ReplaceUserRolesAsync)
            .WithName("ReplaceUserRoles")
            .WithSummary("Replace an account's application roles; only SuperAdmins can manage roles.");

        adminUsers.MapPost("/{userId:guid}/revoke-sessions", RevokeUserSessionsAsync)
            .WithName("RevokeUserSessions")
            .WithSummary("Revoke refresh and cookie sessions for an account.");

        var adminOrganizations = versionedApi.MapGroup("/admin/organizations")
            .WithTags("Organization administration")
            .RequireAuthorization("AdminAccess");
        adminOrganizations.MapGet("", ListOrganizationsAsync)
            .WithName("ListAdminOrganizations")
            .WithSummary("List organization accounts and active membership counts for DigiSay administrators.");

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

    private static async Task<IResult> BootstrapAdminAsync(
        HttpContext httpContext,
        BootstrapAdminRequest request,
        IOptions<IdentityBootstrapOptions> bootstrapOptions,
        UserManager<DigiSayUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        DigiSayDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var configuredSecret = bootstrapOptions.Value.BootstrapAdminSecret;
        if (string.IsNullOrEmpty(configuredSecret))
        {
            return Results.NotFound();
        }

        var submittedSecret = Encoding.UTF8.GetBytes(request.Secret ?? string.Empty);
        var expectedSecret = Encoding.UTF8.GetBytes(configuredSecret);
        if (submittedSecret.Length != expectedSecret.Length ||
            !CryptographicOperations.FixedTimeEquals(submittedSecret, expectedSecret))
        {
            return Results.Unauthorized();
        }

        var user = await userManager.GetUserAsync(httpContext.User);
        if (user is null || !user.EmailConfirmed)
        {
            return Results.Forbid();
        }

        var role = await roleManager.FindByNameAsync(DigiSayRoles.SuperAdmin);
        if (role is null)
        {
            return Results.Problem(statusCode: StatusCodes.Status503ServiceUnavailable, title: "Identity roles are not initialized.");
        }

        var strategy = dbContext.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await dbContext.Database.BeginTransactionAsync(
                IsolationLevel.Serializable,
                cancellationToken);
            if (await dbContext.UserRoles.AnyAsync(item => item.RoleId == role.Id, cancellationToken))
            {
                return Results.Conflict(new { error = "SuperAdmin bootstrap has already been completed." });
            }

            var assignment = await userManager.AddToRoleAsync(user, DigiSayRoles.SuperAdmin);
            if (!assignment.Succeeded)
            {
                return IdentityFailure(assignment);
            }

            await transaction.CommitAsync(cancellationToken);
            return Results.NoContent();
        });
    }

    private static async Task<IResult> ReplaceUserRolesAsync(
        Guid userId,
        ReplaceUserRolesRequest request,
        UserManager<DigiSayUser> userManager,
        DigiSayDbContext dbContext,
        CancellationToken cancellationToken)
    {
        if (request.Roles is null || request.Roles.Length > DigiSayRoles.All.Count)
        {
            return Results.ValidationProblem(new Dictionary<string, string[]> { ["roles"] = ["Provide a valid role list."] });
        }

        var canonicalRoles = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var role in DigiSayRoles.All)
        {
            canonicalRoles.TryAdd(role, role);
        }

        var requestedRoles = new List<string>(request.Roles.Length);
        foreach (var role in request.Roles)
        {
            if (string.IsNullOrWhiteSpace(role) || !canonicalRoles.TryGetValue(role, out var canonicalRole) ||
                requestedRoles.Contains(canonicalRole, StringComparer.Ordinal))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]> { ["roles"] = ["Roles must be known, unique role names."] });
            }

            requestedRoles.Add(canonicalRole);
        }

        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null)
        {
            return Results.NotFound();
        }

        var currentRoles = await userManager.GetRolesAsync(user);
        var removingSuperAdmin = currentRoles.Contains(DigiSayRoles.SuperAdmin, StringComparer.Ordinal) &&
            !requestedRoles.Contains(DigiSayRoles.SuperAdmin, StringComparer.Ordinal);
        var strategy = dbContext.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await dbContext.Database.BeginTransactionAsync(
                IsolationLevel.Serializable,
                cancellationToken);
            if (removingSuperAdmin)
            {
                var superAdminRole = await dbContext.Roles.SingleAsync(
                    role => role.NormalizedName == DigiSayRoles.SuperAdmin.ToUpperInvariant(),
                    cancellationToken);
                var superAdminCount = await dbContext.UserRoles.CountAsync(
                    item => item.RoleId == superAdminRole.Id,
                    cancellationToken);
                if (superAdminCount <= 1)
                {
                    return Results.Conflict(new { error = "The last SuperAdmin cannot be removed." });
                }
            }

            var removeResult = await userManager.RemoveFromRolesAsync(
                user, currentRoles.Except(requestedRoles, StringComparer.Ordinal));
            if (!removeResult.Succeeded)
            {
                return IdentityFailure(removeResult);
            }

            var addResult = await userManager.AddToRolesAsync(
                user, requestedRoles.Except(currentRoles, StringComparer.Ordinal));
            if (!addResult.Succeeded)
            {
                return IdentityFailure(addResult);
            }

            var stampResult = await userManager.UpdateSecurityStampAsync(user);
            if (!stampResult.Succeeded)
            {
                return IdentityFailure(stampResult);
            }

            await transaction.CommitAsync(cancellationToken);
            return Results.Ok(new UserRolesResponse(user.Id, requestedRoles));
        });
    }

    private static async Task<IResult> ListUsersAsync(
        string? search,
        int? page,
        int? pageSize,
        DigiSayDbContext dbContext,
        CancellationToken cancellationToken)
    {
        if (page is < 1 or > 10_000 || pageSize is < 1 or > 100 || search?.Length > 256)
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["pagination"] = ["Page must be 1–10,000, pageSize 1–100, and search at most 256 characters."],
            });
        }

        var pageNumber = page ?? 1;
        var size = pageSize ?? 25;
        var usersQuery = dbContext.Users.AsNoTracking().Where(user => user.Email != null);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim();
            usersQuery = usersQuery.Where(user => user.Email != null && user.Email.Contains(normalizedSearch));
        }

        var users = await usersQuery
            .OrderBy(user => user.Email)
            .ThenBy(user => user.Id)
            .Skip((pageNumber - 1) * size)
            .Take(size)
            .Select(user => new AdminUserRow(user.Id, user.Email!, user.DisplayName, user.EmailConfirmed))
            .ToListAsync(cancellationToken);
        if (users.Count == 0)
        {
            return Results.Ok(new AdminUserPage(pageNumber, size, Array.Empty<AdminUserResponse>()));
        }

        var userIds = users.Select(user => user.Id).ToArray();
        var roles = await (from membership in dbContext.UserRoles.AsNoTracking()
                           join role in dbContext.Roles.AsNoTracking() on membership.RoleId equals role.Id
                           where userIds.Contains(membership.UserId)
                           select new { membership.UserId, role.Name })
            .ToListAsync(cancellationToken);
        var rolesByUser = roles.ToLookup(item => item.UserId, item => item.Name!);
        return Results.Ok(new AdminUserPage(pageNumber, size, users.Select(user =>
            new AdminUserResponse(user.Id, user.Email, user.DisplayName, user.EmailConfirmed,
                rolesByUser[user.Id].Order(StringComparer.Ordinal).ToArray())).ToArray()));
    }

    private static async Task<IResult> ListOrganizationsAsync(
        string? search,
        int? page,
        int? pageSize,
        DigiSayDbContext dbContext,
        CancellationToken cancellationToken)
    {
        if (page is < 1 or > 10_000 || pageSize is < 1 or > 100 || search?.Length > 120)
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["pagination"] = ["Page must be 1–10,000, pageSize 1–100, and search at most 120 characters."],
            });
        }

        var pageNumber = page ?? 1;
        var size = pageSize ?? 25;
        var organizationsQuery = dbContext.Organizations.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim();
            organizationsQuery = organizationsQuery.Where(item => item.Name.Contains(normalizedSearch));
        }

        var totalCount = await organizationsQuery.CountAsync(cancellationToken);
        var organizations = await organizationsQuery
            .OrderBy(item => item.Name)
            .ThenBy(item => item.Id)
            .Skip((pageNumber - 1) * size)
            .Take(size)
            .Select(item => new AdminOrganizationResponse(
                item.Id,
                item.Name,
                item.CreatedAtUtc,
                dbContext.OrganizationMemberships.Count(membership =>
                    membership.OrganizationId == item.Id && membership.Status == OrganizationMembershipStatus.Active)))
            .ToListAsync(cancellationToken);

        return Results.Ok(new AdminOrganizationPage(
            pageNumber,
            size,
            totalCount,
            (int)Math.Ceiling(totalCount / (double)size),
            organizations));
    }

    private static async Task<IResult> RevokeUserSessionsAsync(
        Guid userId,
        UserManager<DigiSayUser> userManager)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null)
        {
            return Results.NotFound();
        }

        var result = await userManager.UpdateSecurityStampAsync(user);
        return result.Succeeded
            ? Results.NoContent()
            : IdentityFailure(result);
    }

    private static IResult IdentityFailure(IdentityResult result) =>
        Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["identity"] = result.Errors.Select(error => error.Code).ToArray(),
        });
}

internal sealed record CurrentUserResponse(Guid Id, string Email, string? DisplayName, IReadOnlyList<string> Roles);

internal sealed record BootstrapAdminRequest
{
    [Required, StringLength(256, MinimumLength = 1)]
    public string? Secret { get; init; }
}

internal sealed record ReplaceUserRolesRequest(string[]? Roles);
internal sealed record UserRolesResponse(Guid UserId, IReadOnlyList<string> Roles);
internal sealed record AdminUserRow(Guid Id, string Email, string? DisplayName, bool EmailConfirmed);
internal sealed record AdminUserResponse(Guid Id, string Email, string? DisplayName, bool EmailConfirmed, IReadOnlyList<string> Roles);
internal sealed record AdminUserPage(int Page, int PageSize, IReadOnlyList<AdminUserResponse> Users);
internal sealed record AdminOrganizationResponse(Guid Id, string Name, DateTimeOffset CreatedAtUtc, int ActiveMemberCount);
internal sealed record AdminOrganizationPage(int Page, int PageSize, int TotalCount, int TotalPages, IReadOnlyList<AdminOrganizationResponse> Items);
