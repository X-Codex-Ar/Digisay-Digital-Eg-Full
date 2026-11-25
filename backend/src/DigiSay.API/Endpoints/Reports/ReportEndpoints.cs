using Asp.Versioning;
using Asp.Versioning.Builder;
using DigiSay.API.Endpoints.Organizations;
using DigiSay.Application.Common.Organizations;
using DigiSay.Domain.Enums;
using DigiSay.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DigiSay.API.Endpoints.Reports;

internal static class ReportEndpoints
{
    public static void MapReportEndpoints(this IEndpointRouteBuilder endpoints, ApiVersionSet apiVersionSet)
    {
        endpoints.MapGroup("/api/v{version:apiVersion}/reports")
            .WithApiVersionSet(apiVersionSet)
            .MapToApiVersion(new ApiVersion(1, 0))
            .WithTags("Reports")
            .RequireAuthorization("AdminOrClientAccess")
            .AddEndpointFilter<VerifiedOrganizationEndpointFilter>()
            .MapGet("/workspace", GetWorkspaceReportAsync)
            .WithName("GetWorkspaceReport")
            .WithSummary("Return organization-scoped CRM counts and lifecycle breakdowns; client accounts only receive service-request data.");
    }

    private static async Task<IResult> GetWorkspaceReportAsync(
        System.Security.Claims.ClaimsPrincipal principal,
        IOrganizationContext organization,
        DigiSayDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var periodStart = now.AddDays(-30);
        var requestQuery = dbContext.ServiceRequests.AsNoTracking()
            .Where(item => item.OrganizationId == organization.OrganizationId);
        var requestTotal = await requestQuery.CountAsync(cancellationToken);
        var requestsByStatus = await requestQuery
            .GroupBy(item => item.Status)
            .Select(group => new { Status = group.Key, Count = group.Count() })
            .ToListAsync(cancellationToken);
        var requestsLast30Days = await requestQuery.CountAsync(
            item => item.CreatedAtUtc >= periodStart, cancellationToken);

        int? leadTotal = null;
        int? leadsLast30Days = null;
        IReadOnlyList<ReportStatusCount> leadsByStatus = [];
        if (principal.IsInRole("SuperAdmin") || principal.IsInRole("Admin") || principal.IsInRole("Manager"))
        {
            var leadQuery = dbContext.Leads.AsNoTracking()
                .Where(item => item.OrganizationId == organization.OrganizationId);
            leadTotal = await leadQuery.CountAsync(cancellationToken);
            leadsLast30Days = await leadQuery.CountAsync(
                item => item.CreatedAtUtc >= periodStart, cancellationToken);
            var groupedLeads = await leadQuery
                .GroupBy(item => item.Status)
                .Select(group => new { Status = group.Key, Count = group.Count() })
                .ToListAsync(cancellationToken);
            leadsByStatus = groupedLeads
                .Select(item => new ReportStatusCount(item.Status.ToString(), item.Count))
                .OrderBy(item => item.Status, StringComparer.Ordinal)
                .ToArray();
        }

        var response = new WorkspaceReport(
            organization.OrganizationId,
            periodStart,
            now,
            leadTotal,
            leadsLast30Days,
            leadsByStatus,
            requestTotal,
            requestsLast30Days,
            requestsByStatus
                .Select(item => new ReportStatusCount(item.Status.ToString(), item.Count))
                .OrderBy(item => item.Status, StringComparer.Ordinal)
                .ToArray());

        return Results.Ok(response);
    }
}

internal sealed record ReportStatusCount(string Status, int Count);
internal sealed record WorkspaceReport(
    Guid OrganizationId,
    DateTimeOffset PeriodStartUtc,
    DateTimeOffset GeneratedAtUtc,
    int? LeadTotal,
    int? LeadsCreatedLast30Days,
    IReadOnlyList<ReportStatusCount> LeadsByStatus,
    int ServiceRequestTotal,
    int ServiceRequestsCreatedLast30Days,
    IReadOnlyList<ReportStatusCount> ServiceRequestsByStatus);
