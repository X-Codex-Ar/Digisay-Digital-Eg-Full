using System.ComponentModel.DataAnnotations;
using Asp.Versioning;
using Asp.Versioning.Builder;
using DigiSay.API.Endpoints.Organizations;
using DigiSay.Application.Common.Organizations;
using DigiSay.Application.Features.CRM.Leads.Commands.CreateLead;
using DigiSay.Application.Features.CRM.Leads.Commands.UpdateLead;
using DigiSay.Application.Features.CRM.Leads.Commands.TransitionLead;
using DigiSay.Application.Features.CRM.Leads.Queries.GetLead;
using DigiSay.Application.Features.CRM.Leads.Queries.ListLeads;
using DigiSay.Application.Features.CRM.ServiceRequests.Commands.CreateServiceRequest;
using DigiSay.Application.Features.CRM.ServiceRequests.Commands.UpdateServiceRequest;
using DigiSay.Application.Features.CRM.ServiceRequests.Commands.TransitionServiceRequest;
using DigiSay.Application.Features.CRM.ServiceRequests.Queries.GetServiceRequest;
using DigiSay.Application.Features.CRM.ServiceRequests.Queries.ListServiceRequests;
using DigiSay.Application.Common.Pagination;
using DigiSay.Domain.Entities.CRM;
using DigiSay.Domain.Enums;
using DigiSay.Domain.Exceptions;

namespace DigiSay.API.Endpoints.Crm;

internal static class CrmEndpoints
{
    public static void MapCrmEndpoints(this IEndpointRouteBuilder endpoints, ApiVersionSet apiVersionSet)
    {
        var crm = endpoints.MapGroup("/api/v{version:apiVersion}/crm")
            .WithApiVersionSet(apiVersionSet)
            .MapToApiVersion(new ApiVersion(1, 0))
            .WithTags("CRM")
            .RequireAuthorization()
            .AddEndpointFilter<VerifiedOrganizationEndpointFilter>()
            .AddEndpointFilter<DomainValidationEndpointFilter>();

        MapLeadEndpoints(crm.MapGroup("/leads").RequireAuthorization("AdminAccess"));
        MapServiceRequestEndpoints(crm.MapGroup("/service-requests"));
    }

    private static void MapLeadEndpoints(RouteGroupBuilder leads)
    {
        leads.MapPost("", async (
                LeadRequest request,
                IOrganizationContext scope,
                CreateLeadHandler handler,
                CancellationToken cancellationToken) =>
            {
                var errors = request.Validate();
                if (errors.Count > 0)
                {
                    return Results.ValidationProblem(errors);
                }

                var lead = await handler.HandleAsync(request.ToCreateCommand(), scope, cancellationToken);
                return Results.Created($"/api/v1/crm/leads/{lead.Id}", ToResponse(lead));
            })
            .AddEndpointFilter<OrganizationOwnerEndpointFilter>()
            .WithName("CreateLead")
            .WithSummary("Create a lead in the verified organization.");

        leads.MapGet("", async (
                int? page,
                int? pageSize,
                IOrganizationContext scope,
                ListLeadsHandler handler,
                CancellationToken cancellationToken) =>
            {
                if (!TryPagination(page, pageSize, out var currentPage, out var size, out var errors))
                {
                    return Results.ValidationProblem(errors);
                }

                var slice = await handler.HandleAsync(new ListLeadsQuery((currentPage - 1) * size, size), scope, cancellationToken);
                return Results.Ok(ToPage(slice, currentPage, size, slice.Items.Select(ToResponse).ToArray()));
            })
            .WithName("ListLeads")
            .WithSummary("List leads belonging to the verified organization.");

        leads.MapGet("/{id:guid}", async (
                Guid id,
                IOrganizationContext scope,
                GetLeadHandler handler,
                CancellationToken cancellationToken) =>
            {
                var lead = await handler.HandleAsync(new GetLeadQuery(id), scope, cancellationToken);
                return lead is null ? Results.NotFound() : Results.Ok(ToResponse(lead));
            })
            .WithName("GetLead")
            .WithSummary("Get a lead only when it belongs to the verified organization.");

        leads.MapPut("/{id:guid}", async (
                Guid id,
                LeadRequest request,
                IOrganizationContext scope,
                UpdateLeadHandler handler,
                CancellationToken cancellationToken) =>
            {
                var errors = request.Validate();
                if (errors.Count > 0)
                {
                    return Results.ValidationProblem(errors);
                }

                var lead = await handler.HandleAsync(id, request.ToUpdateCommand(), scope, cancellationToken);
                return lead is null ? Results.NotFound() : Results.Ok(ToResponse(lead));
            })
            .AddEndpointFilter<OrganizationOwnerEndpointFilter>()
            .WithName("UpdateLead")
            .WithSummary("Update lead details in the verified organization.");

        leads.MapPost("/{id:guid}/transitions", async (
                Guid id,
                LeadTransitionRequest request,
                IOrganizationContext scope,
                TransitionLeadHandler handler,
                CancellationToken cancellationToken) =>
            {
                if (!request.TryGetStatus(out var target))
                {
                    return Results.ValidationProblem(new Dictionary<string, string[]>
                    {
                        [nameof(request.Status)] = ["Status is not recognized."],
                    });
                }

                var result = await handler.HandleAsync(id, new TransitionLeadCommand(target), scope, cancellationToken);
                if (!result.Found)
                {
                    return Results.NotFound();
                }

                return result.Transitioned
                    ? Results.Ok(ToResponse(result.Lead!))
                    : Results.Problem(statusCode: StatusCodes.Status409Conflict, title: "Invalid lead status transition.");
            })
            .AddEndpointFilter<OrganizationOwnerEndpointFilter>()
            .WithName("TransitionLead")
            .WithSummary("Move a lead through its allowed lifecycle states.");
    }

    private static void MapServiceRequestEndpoints(RouteGroupBuilder requests)
    {
        requests.MapPost("", async (
                ServiceRequestInput request,
                IOrganizationContext scope,
                CreateServiceRequestHandler handler,
                CancellationToken cancellationToken) =>
            {
                var errors = request.Validate();
                if (errors.Count > 0)
                {
                    return Results.ValidationProblem(errors);
                }

                var serviceRequest = await handler.HandleAsync(request.ToCreateCommand(), scope, cancellationToken);
                return Results.Created($"/api/v1/crm/service-requests/{serviceRequest.Id}", ToResponse(serviceRequest));
            })
            .RequireAuthorization("AdminOrClientAccess")
            .WithName("CreateServiceRequest")
            .WithSummary("Submit a service request for the verified organization.");

        requests.MapGet("", async (
                int? page,
                int? pageSize,
                IOrganizationContext scope,
                ListServiceRequestsHandler handler,
                CancellationToken cancellationToken) =>
            {
                if (!TryPagination(page, pageSize, out var currentPage, out var size, out var errors))
                {
                    return Results.ValidationProblem(errors);
                }

                var slice = await handler.HandleAsync(new ListServiceRequestsQuery((currentPage - 1) * size, size), scope, cancellationToken);
                return Results.Ok(ToPage(slice, currentPage, size, slice.Items.Select(ToResponse).ToArray()));
            })
            .RequireAuthorization("AdminAccess")
            .WithName("ListServiceRequests")
            .WithSummary("List service requests belonging to the verified organization.");

        requests.MapGet("/{id:guid}", async (
                Guid id,
                IOrganizationContext scope,
                GetServiceRequestHandler handler,
                CancellationToken cancellationToken) =>
            {
                var serviceRequest = await handler.HandleAsync(new GetServiceRequestQuery(id), scope, cancellationToken);
                return serviceRequest is null ? Results.NotFound() : Results.Ok(ToResponse(serviceRequest));
            })
            .RequireAuthorization("AdminAccess")
            .WithName("GetServiceRequest")
            .WithSummary("Get a service request only when it belongs to the verified organization.");

        requests.MapPut("/{id:guid}", async (
                Guid id,
                ServiceRequestInput request,
                IOrganizationContext scope,
                UpdateServiceRequestHandler handler,
                CancellationToken cancellationToken) =>
            {
                var errors = request.Validate();
                if (errors.Count > 0)
                {
                    return Results.ValidationProblem(errors);
                }

                var serviceRequest = await handler.HandleAsync(id, request.ToUpdateCommand(), scope, cancellationToken);
                return serviceRequest is null ? Results.NotFound() : Results.Ok(ToResponse(serviceRequest));
            })
            .RequireAuthorization("AdminAccess")
            .AddEndpointFilter<OrganizationOwnerEndpointFilter>()
            .WithName("UpdateServiceRequest")
            .WithSummary("Update service request details in the verified organization.");

        requests.MapPost("/{id:guid}/transitions", async (
                Guid id,
                ServiceRequestTransitionRequest request,
                IOrganizationContext scope,
                TransitionServiceRequestHandler handler,
                CancellationToken cancellationToken) =>
            {
                if (!request.TryGetStatus(out var target))
                {
                    return Results.ValidationProblem(new Dictionary<string, string[]>
                    {
                        [nameof(request.Status)] = ["Status is not recognized."],
                    });
                }

                var result = await handler.HandleAsync(id, new TransitionServiceRequestCommand(target), scope, cancellationToken);
                if (!result.Found)
                {
                    return Results.NotFound();
                }

                return result.Transitioned
                    ? Results.Ok(ToResponse(result.Request!))
                    : Results.Problem(statusCode: StatusCodes.Status409Conflict, title: "Invalid service request status transition.");
            })
            .RequireAuthorization("AdminAccess")
            .AddEndpointFilter<OrganizationOwnerEndpointFilter>()
            .WithName("TransitionServiceRequest")
            .WithSummary("Move a service request through its allowed lifecycle states.");
    }

    private static bool TryPagination(int? page, int? pageSize, out int currentPage, out int size, out Dictionary<string, string[]> errors)
    {
        currentPage = page ?? 1;
        size = pageSize ?? 20;
        errors = [];

        if (currentPage is < 1 or > 1_000_000)
        {
            errors[nameof(page)] = ["Page must be between 1 and 1000000."];
        }

        if (size is < 1 or > 100)
        {
            errors[nameof(pageSize)] = ["Page size must be between 1 and 100."];
        }

        return errors.Count == 0;
    }

    private static PagedResponse<TItem> ToPage<TEntity, TItem>(PageSlice<TEntity> slice, int page, int pageSize, IReadOnlyList<TItem> items) =>
        new(items, page, pageSize, slice.TotalCount, (int)Math.Ceiling(slice.TotalCount / (double)pageSize));

    private static LeadResponse ToResponse(Lead lead) => new(
        lead.Id, lead.Name, lead.Email.Value, lead.Phone, lead.Source, lead.Status.ToString(),
        lead.CreatedByUserId, lead.UpdatedByUserId, lead.CreatedAtUtc, lead.UpdatedAtUtc);

    private static ServiceRequestResponse ToResponse(ServiceRequest request) => new(
        request.Id, request.Title, request.Description, request.Service, request.Status.ToString(),
        request.CreatedByUserId, request.UpdatedByUserId, request.CreatedAtUtc, request.UpdatedAtUtc);
}

internal sealed record PagedResponse<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount, int TotalPages);
internal sealed record LeadResponse(Guid Id, string Name, string Email, string? Phone, string? Source, string Status, Guid CreatedByUserId, Guid UpdatedByUserId, DateTimeOffset CreatedAtUtc, DateTimeOffset UpdatedAtUtc);
internal sealed record ServiceRequestResponse(Guid Id, string Title, string Description, string Service, string Status, Guid CreatedByUserId, Guid UpdatedByUserId, DateTimeOffset CreatedAtUtc, DateTimeOffset UpdatedAtUtc);

internal sealed record LeadRequest
{
    [Required, StringLength(150, MinimumLength = 2)]
    public string? Name { get; init; }

    [Required, EmailAddress, StringLength(254)]
    public string? Email { get; init; }

    [StringLength(25)]
    public string? Phone { get; init; }

    [StringLength(80)]
    public string? Source { get; init; }

    public CreateLeadCommand ToCreateCommand() => new(Name!, Email!, Phone, Source);
    public UpdateLeadCommand ToUpdateCommand() => new(Name!, Email!, Phone, Source);
    public Dictionary<string, string[]> Validate() => RequestValidation.ValidateModel(this);
}

internal sealed record LeadTransitionRequest
{
    [Required]
    public string? Status { get; init; }

    public bool TryGetStatus(out LeadStatus status) => Enum.TryParse(Status, ignoreCase: true, out status) && Enum.IsDefined(status);
}

internal sealed record ServiceRequestInput
{
    [Required, StringLength(150, MinimumLength = 3)]
    public string? Title { get; init; }

    [Required, StringLength(2000, MinimumLength = 1)]
    public string? Description { get; init; }

    [Required, StringLength(80, MinimumLength = 2)]
    public string? Service { get; init; }

    public CreateServiceRequestCommand ToCreateCommand() => new(Title!, Description!, Service!);
    public UpdateServiceRequestCommand ToUpdateCommand() => new(Title!, Description!, Service!);
    public Dictionary<string, string[]> Validate() => RequestValidation.ValidateModel(this);
}

internal sealed record ServiceRequestTransitionRequest
{
    [Required]
    public string? Status { get; init; }

    public bool TryGetStatus(out ServiceRequestStatus status) => Enum.TryParse(Status, ignoreCase: true, out status) && Enum.IsDefined(status);
}

internal static class RequestValidation
{
    public static Dictionary<string, string[]> ValidateModel<T>(T model)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(model!, new ValidationContext(model!), results, validateAllProperties: true);

        return results
            .SelectMany(result =>
            {
                var members = result.MemberNames.Any() ? result.MemberNames : [""];
                return members.Select(member => new
                {
                    Member = member,
                    Message = result.ErrorMessage ?? "Invalid value.",
                });
            })
            .GroupBy(item => item.Member)
            .ToDictionary(group => group.Key, group => group.Select(item => item.Message).ToArray());
    }
}

internal sealed class DomainValidationEndpointFilter : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        try
        {
            return await next(context);
        }
        catch (DomainValidationException exception)
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                [exception.PropertyName] = [exception.Message],
            });
        }
    }
}
