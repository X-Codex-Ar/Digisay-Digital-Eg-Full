using Asp.Versioning;
using Asp.Versioning.Builder;
using DigiSay.API.Endpoints.ContactInquiries;
using DigiSay.API.Endpoints.Identity;

namespace DigiSay.API.Endpoints;

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
