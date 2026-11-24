using System.Security.Claims;
using DigiSay.Application.Common.Organizations;
using DigiSay.Application.Features.Organizations.Abstractions;

namespace DigiSay.API.Endpoints.Organizations;

/// <summary>Resolves the selected organization only after proving active membership.</summary>
internal sealed class VerifiedOrganizationEndpointFilter(
    IOrganizationStore organizationStore,
    OrganizationContext organizationContext) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(
        EndpointFilterInvocationContext context,
        EndpointFilterDelegate next)
    {
        if (!Guid.TryParse(context.HttpContext.Request.Headers["X-Organization-Id"], out var organizationId) ||
            organizationId == Guid.Empty)
        {
            return Results.Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "An active organization must be selected.",
                detail: "Supply an organization identifier in the X-Organization-Id header.");
        }

        var userIdValue = context.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            context.HttpContext.User.FindFirstValue("sub");
        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return Results.Unauthorized();
        }

        var membership = await organizationStore.FindActiveMembershipAsync(
            organizationId, userId, context.HttpContext.RequestAborted);

        if (membership is null)
        {
            // Do not reveal whether an organization exists when the caller has no active membership.
            return Results.NotFound();
        }

        organizationContext.Set(membership.OrganizationId, userId, membership.MembershipRole);
        return await next(context);
    }
}
