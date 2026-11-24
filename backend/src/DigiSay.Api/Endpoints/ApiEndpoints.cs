using Asp.Versioning;
using Asp.Versioning.Builder;
using DigiSay.Api.Endpoints.ContactInquiries;
using DigiSay.Api.Endpoints.Identity;

namespace DigiSay.Api.Endpoints;

public static class ApiEndpoints
{
    public static void MapApiEndpoints(this IEndpointRouteBuilder endpoints, ApiVersionSet apiVersionSet)
    {
        var versionedApi = endpoints
            .MapGroup("/api/v{version:apiVersion}")
            .WithApiVersionSet(apiVersionSet);

        versionedApi.MapGet("/health", () => Results.Ok(new { status = "ok" }))
            .WithName("GetApiHealth")
            .WithSummary("Check API liveness.")
            .AllowAnonymous()
            .MapToApiVersion(new ApiVersion(1, 0));

        versionedApi.MapContactInquiryEndpoints();
        versionedApi.MapIdentityEndpoints();
    }
}
