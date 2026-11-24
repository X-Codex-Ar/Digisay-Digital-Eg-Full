using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Asp.Versioning;
using Asp.Versioning.Builder;
using DigiSay.Application.Organizations;
using DigiSay.Domain.Organizations;
using DigiSay.Infrastructure.Identity;
using DigiSay.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DigiSay.Api.Endpoints.Organizations;

internal static class OrganizationEndpoints
{
    public static void MapOrganizationEndpoints(this IEndpointRouteBuilder endpoints, ApiVersionSet apiVersionSet)
    {
        var organizations = endpoints.MapGroup("/api/v{version:apiVersion}/organizations")
            .WithApiVersionSet(apiVersionSet)
            .MapToApiVersion(new ApiVersion(1, 0))
            .WithTags("Organizations")
            .RequireAuthorization();

        organizations.MapPost("", async (
                CreateOrganizationRequest request,
                ClaimsPrincipal principal,
                UserManager<DigiSayUser> userManager,
                DigiSayDbContext dbContext,
                CancellationToken cancellationToken) =>
            {
                var errors = request.Validate();
                if (errors.Count > 0)
                {
                    return Results.ValidationProblem(errors);
                }

                var userIdValue = userManager.GetUserId(principal);
                if (!Guid.TryParse(userIdValue, out var userId))
                {
                    return Results.Unauthorized();
                }

                var organization = Organization.Create(request.Name!);
                dbContext.Organizations.Add(organization);
                dbContext.OrganizationMemberships.Add(
                    OrganizationMembership.CreateOwner(organization.Id, userId));
                await dbContext.SaveChangesAsync(cancellationToken);

                return Results.Created(
                    $"/api/v1/organizations/{organization.Id}",
                    new OrganizationResponse(organization.Id, organization.Name, "Owner"));
            })
            .WithName("CreateOrganization")
            .WithSummary("Create an organization and grant the creator its owner membership.");

        organizations.MapGet("", async (
                ClaimsPrincipal principal,
                UserManager<DigiSayUser> userManager,
                DigiSayDbContext dbContext,
                CancellationToken cancellationToken) =>
            {
                var userIdValue = userManager.GetUserId(principal);
                if (!Guid.TryParse(userIdValue, out var userId))
                {
                    return Results.Unauthorized();
                }

                var memberships = await dbContext.OrganizationMemberships
                    .AsNoTracking()
                    .Where(membership => membership.UserId == userId &&
                        membership.Status == OrganizationMembershipStatus.Active)
                    .OrderBy(membership => membership.Organization!.Name)
                    .Select(membership => new OrganizationResponse(
                        membership.OrganizationId,
                        membership.Organization!.Name,
                        membership.Role))
                    .ToListAsync(cancellationToken);

                return Results.Ok(memberships);
            })
            .WithName("GetMyOrganizations")
            .WithSummary("List only organizations where the signed-in user has active membership.");

        organizations.MapGet("/current", (
                IOrganizationContext organizationContext,
                DigiSayDbContext dbContext,
                CancellationToken cancellationToken) =>
            {
                return GetCurrentOrganizationAsync(organizationContext, dbContext, cancellationToken);
            })
            .AddEndpointFilter<VerifiedOrganizationEndpointFilter>()
            .WithName("GetCurrentOrganization")
            .WithSummary("Resolve the selected organization after verifying active server-side membership.");
    }

    private static async Task<IResult> GetCurrentOrganizationAsync(
        IOrganizationContext organizationContext,
        DigiSayDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var organization = await dbContext.Organizations
            .AsNoTracking()
            .Where(candidate => candidate.Id == organizationContext.OrganizationId)
            .Select(candidate => new OrganizationResponse(
                candidate.Id,
                candidate.Name,
                organizationContext.MembershipRole))
            .SingleAsync(cancellationToken);

        return Results.Ok(organization);
    }
}

internal sealed record CreateOrganizationRequest
{
    [Required, StringLength(120, MinimumLength = 2)]
    public string? Name { get; init; }

    public Dictionary<string, string[]> Validate()
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(this, new ValidationContext(this), results, validateAllProperties: true);

        if (!string.IsNullOrWhiteSpace(Name) && Name.Trim().Length < 2)
        {
            results.Add(new ValidationResult(
                "Organization name must contain at least 2 non-whitespace characters.",
                [nameof(Name)]));
        }

        return results
            .SelectMany(result => result.MemberNames.Select(member => new
            {
                Member = member,
                Message = result.ErrorMessage ?? "Invalid value.",
            }))
            .GroupBy(item => item.Member)
            .ToDictionary(group => group.Key, group => group.Select(item => item.Message).ToArray());
    }
}

internal sealed record OrganizationResponse(Guid Id, string Name, string MembershipRole);
