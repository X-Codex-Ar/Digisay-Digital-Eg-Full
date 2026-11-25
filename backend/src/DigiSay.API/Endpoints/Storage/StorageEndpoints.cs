using Asp.Versioning;
using Asp.Versioning.Builder;
using DigiSay.API.Endpoints.Organizations;
using DigiSay.Application.Common.Organizations;
using DigiSay.Application.Features.Content;
using DigiSay.Application.Features.Content.Commands.DeleteObject;
using DigiSay.Application.Features.Content.Commands.UploadObject;
using DigiSay.Application.Features.Content.Queries.CreateDownloadLink;
using DigiSay.Application.Features.Content.Queries.ListObjects;
using Microsoft.AspNetCore.Mvc;

namespace DigiSay.API.Endpoints.Storage;

internal static class StorageEndpoints
{
    public static void MapStorageEndpoints(this IEndpointRouteBuilder endpoints, ApiVersionSet apiVersionSet)
    {
        var storage = endpoints.MapGroup("/api/v{version:apiVersion}/storage/objects")
            .WithApiVersionSet(apiVersionSet)
            .MapToApiVersion(new ApiVersion(1, 0))
            .WithTags("Private storage")
            .RequireAuthorization()
            .AddEndpointFilter<VerifiedOrganizationEndpointFilter>()
            .DisableAntiforgery()
            .WithMetadata(new RequestFormLimitsAttribute
            {
                MultipartBodyLengthLimit = UploadObjectHandler.MaximumFileSizeBytes + 64 * 1024,
            });

        storage.MapPost("", async (
                IFormFile? file,
                IOrganizationContext organization,
                UploadObjectHandler handler,
                CancellationToken cancellationToken) =>
            {
                if (file is null)
                {
                    return Results.ValidationProblem(new Dictionary<string, string[]>
                    {
                        ["file"] = ["A file is required."],
                    });
                }

                if (file.Length <= 0 || file.Length > UploadObjectHandler.MaximumFileSizeBytes)
                {
                    return Results.ValidationProblem(new Dictionary<string, string[]>
                    {
                        ["file"] = [$"File size must be between 1 and {UploadObjectHandler.MaximumFileSizeBytes} bytes."],
                    });
                }

                try
                {
                    await using var stream = file.OpenReadStream();
                    var stored = await handler.HandleAsync(
                        new UploadObjectCommand(organization.OrganizationId, stream, file.Length), cancellationToken);
                    return Results.Created($"/api/v1/storage/objects/{stored.Id}", stored);
                }
                catch (StorageValidationException exception)
                {
                    return Results.ValidationProblem(new Dictionary<string, string[]> { ["file"] = [exception.Message] });
                }
                catch (StorageProviderException exception)
                {
                    return StorageUnavailable(exception);
                }
            })
            .AddEndpointFilter<OrganizationOwnerEndpointFilter>()
            .Accepts<IFormFile>("multipart/form-data")
            .WithName("UploadPrivateObject")
            .WithSummary("Upload a validated object to the current organization's private storage path.");

        storage.MapGet("", async (
                IOrganizationContext organization,
                ListObjectsHandler handler,
                CancellationToken cancellationToken) =>
            {
                try
                {
                    return (IResult)Results.Ok(await handler.HandleAsync(organization.OrganizationId, cancellationToken));
                }
                catch (StorageProviderException exception)
                {
                    return (IResult)StorageUnavailable(exception);
                }
            })
            .WithName("ListPrivateObjects")
            .WithSummary("List private objects for the verified organization.");

        storage.MapPost("/{objectId:guid}/download-link", async (
                Guid objectId,
                IOrganizationContext organization,
                CreateDownloadLinkHandler handler,
                CancellationToken cancellationToken) =>
            {
                try
                {
                    var link = await handler.HandleAsync(
                        new CreateDownloadLinkQuery(organization.OrganizationId, objectId), cancellationToken);
                    return Results.Ok(link);
                }
                catch (StorageValidationException exception)
                {
                    return Results.ValidationProblem(new Dictionary<string, string[]> { ["objectId"] = [exception.Message] });
                }
                catch (StorageProviderException exception) when (IsMissingObject(exception))
                {
                    return Results.NotFound();
                }
                catch (StorageProviderException exception)
                {
                    return StorageUnavailable(exception);
                }
            })
            .WithName("CreatePrivateObjectDownloadLink")
            .WithSummary("Create a five-minute signed download URL for an object in the current organization.");

        storage.MapDelete("/{objectId:guid}", async (
                Guid objectId,
                IOrganizationContext organization,
                DeleteObjectHandler handler,
                CancellationToken cancellationToken) =>
            {
                try
                {
                    await handler.HandleAsync(
                        new DeleteObjectCommand(organization.OrganizationId, objectId), cancellationToken);
                    return Results.NoContent();
                }
                catch (StorageValidationException exception)
                {
                    return Results.ValidationProblem(new Dictionary<string, string[]> { ["objectId"] = [exception.Message] });
                }
                catch (StorageProviderException exception) when (IsMissingObject(exception))
                {
                    return Results.NotFound();
                }
                catch (StorageProviderException exception)
                {
                    return StorageUnavailable(exception);
                }
            })
            .AddEndpointFilter<OrganizationOwnerEndpointFilter>()
            .WithName("DeletePrivateObject")
            .WithSummary("Delete an object from the current organization's private storage path.");
    }

    private static bool IsMissingObject(StorageProviderException exception) =>
        exception.StatusCode == StatusCodes.Status404NotFound;

    private static IResult StorageUnavailable(StorageProviderException exception) =>
        Results.Problem(
            statusCode: exception.StatusCode == StatusCodes.Status503ServiceUnavailable
                ? StatusCodes.Status503ServiceUnavailable
                : StatusCodes.Status502BadGateway,
            title: "Private storage is unavailable.");
}
