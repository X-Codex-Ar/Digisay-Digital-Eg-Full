using DigiSay.Application.Common.Organizations;

namespace DigiSay.API.Endpoints.Organizations;

internal sealed class OrganizationOwnerEndpointFilter(IOrganizationContext organizationContext) : IEndpointFilter
{
    public ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        if (!string.Equals(organizationContext.MembershipRole, "Owner", StringComparison.Ordinal))
        {
            return ValueTask.FromResult<object?>(Results.Forbid());
        }

        return next(context);
    }
}
