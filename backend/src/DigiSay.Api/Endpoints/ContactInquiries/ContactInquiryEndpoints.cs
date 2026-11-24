using System.ComponentModel.DataAnnotations;
using Asp.Versioning;
using Asp.Versioning.Builder;
using DigiSay.Application.ContactInquiries;

namespace DigiSay.Api.Endpoints.ContactInquiries;

internal static class ContactInquiryEndpoints
{
    public static RouteGroupBuilder MapContactInquiryEndpoints(this RouteGroupBuilder versionedApi)
    {
        versionedApi.MapPost("/contact-inquiries", async (
                ContactInquiryRequest request,
                HttpContext httpContext,
                CreateContactInquiryHandler handler,
                CancellationToken cancellationToken) =>
            {
                var validationErrors = request.Validate();
                if (validationErrors.Count > 0)
                {
                    return Results.ValidationProblem(validationErrors);
                }

                if (!string.IsNullOrWhiteSpace(request.BotField))
                {
                    return Results.Accepted();
                }

                var inquiry = await handler.HandleAsync(
                    request.ToCommand(),
                    httpContext.Connection.RemoteIpAddress?.ToString(),
                    cancellationToken);

                return Results.Json(
                    new ContactInquiryResponse(inquiry.Id, inquiry.CreatedAtUtc),
                    statusCode: StatusCodes.Status201Created);
            })
            .WithName("CreateContactInquiry")
            .WithSummary("Submit a public contact inquiry.")
            .MapToApiVersion(new ApiVersion(1, 0))
            .RequireRateLimiting("public-contact");

        return versionedApi;
    }
}

internal sealed record ContactInquiryRequest
{
    [Required, StringLength(50, MinimumLength = 1)]
    public string? FirstName { get; init; }

    [Required, StringLength(50, MinimumLength = 1)]
    public string? LastName { get; init; }

    [Required, EmailAddress, StringLength(254)]
    public string? Email { get; init; }

    [StringLength(25)]
    public string? Phone { get; init; }

    [Required, StringLength(80, MinimumLength = 2)]
    public string? Service { get; init; }

    [StringLength(2000)]
    public string? Message { get; init; }

    [StringLength(200)]
    public string? BotField { get; init; }

    public CreateContactInquiryCommand ToCommand() => new(
        FirstName!, LastName!, Email!, Phone, Service!, Message);

    public Dictionary<string, string[]> Validate()
    {
        var results = new List<ValidationResult>();
        var context = new ValidationContext(this);
        Validator.TryValidateObject(this, context, results, validateAllProperties: true);

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

internal sealed record ContactInquiryResponse(Guid Id, DateTimeOffset CreatedAtUtc);
