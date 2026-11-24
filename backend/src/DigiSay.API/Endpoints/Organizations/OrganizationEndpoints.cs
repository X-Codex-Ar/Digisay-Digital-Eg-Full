using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Asp.Versioning;
using Asp.Versioning.Builder;
using DigiSay.Application.Common.Organizations;
using DigiSay.Application.Features.Organizations.Commands.CreateOrganization;
using DigiSay.Application.Features.Organizations.Queries.ListMyOrganizations;
using DigiSay.Application.Features.Organizations.Queries.GetCurrentOrganization;
using DigiSay.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;

namespace DigiSay.API.Endpoints.Organizations;

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
                CreateOrganizationHandler handler,
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

                var organization = await handler.HandleAsync(new(request.Name!, userId), cancellationToken);

                return Results.Json(
                    new OrganizationResponse(organization.Id, organization.Name, "Owner"),
                    statusCode: StatusCodes.Status201Created);
            })
            .WithName("CreateOrganization")
            .WithSummary("Create an organization and grant the creator its owner membership.");

        organizations.MapGet("", async (
                ClaimsPrincipal principal,
                UserManager<DigiSayUser> userManager,
                ListMyOrganizationsHandler handler,
                CancellationToken cancellationToken) =>
            {
                var userIdValue = userManager.GetUserId(principal);
                if (!Guid.TryParse(userIdValue, out var userId))
                {
                    return Results.Unauthorized();
                }

                var memberships = await handler.HandleAsync(new(userId), cancellationToken);

                return Results.Ok(memberships.Select(item => new OrganizationResponse(
                    item.OrganizationId, item.OrganizationName, item.MembershipRole)));
            })
            .WithName("GetMyOrganizations")
            .WithSummary("List only organizations where the signed-in user has active membership.");

        organizations.MapGet("/current", (
                IOrganizationContext organizationContext,
                GetCurrentOrganizationHandler handler,
                CancellationToken cancellationToken) =>
            {
                return GetCurrentOrganizationAsync(organizationContext, handler, cancellationToken);
            })
            .AddEndpointFilter<VerifiedOrganizationEndpointFilter>()
            .WithName("GetCurrentOrganization")
            .WithSummary("Resolve the selected organization after verifying active server-side membership.");
    }

    private static async Task<IResult> GetCurrentOrganizationAsync(
        IOrganizationContext organizationContext,
        GetCurrentOrganizationHandler handler,
        CancellationToken cancellationToken)
    {
        var organization = await handler.HandleAsync(
            new(organizationContext.OrganizationId, organizationContext.MembershipRole), cancellationToken);

        return organization is null
            ? Results.NotFound()
            : Results.Ok(new OrganizationResponse(organization.OrganizationId, organization.OrganizationName, organization.MembershipRole));
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
