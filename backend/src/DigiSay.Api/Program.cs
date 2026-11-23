using Asp.Versioning;
using DigiSay.Application.ContactInquiries;
using DigiSay.Domain;
using DigiSay.Infrastructure;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using System.ComponentModel.DataAnnotations;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ??
        ["http://localhost:3000", "http://localhost:4200", "http://localhost:5173", "http://localhost:8080"];
    options.AddPolicy("frontends", policy =>
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod());
});
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("public-contact", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(10),
                QueueLimit = 0,
                AutoReplenishment = true,
            }));
});
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = false;
    options.ReportApiVersions = true;
    options.ApiVersionReader = new UrlSegmentApiVersionReader();
});
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();
app.UseExceptionHandler();
app.UseCors("frontends");
app.UseRateLimiter();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

var apiVersionSet = app.NewApiVersionSet()
    .HasApiVersion(new ApiVersion(1, 0))
    .ReportApiVersions()
    .Build();

app.MapGet("/api/v{version:apiVersion}/health", () => Results.Ok(new { status = "ok" }))
    .WithName("GetApiHealth")
    .WithApiVersionSet(apiVersionSet)
    .MapToApiVersion(new ApiVersion(1, 0));

app.MapPost("/api/v{version:apiVersion}/contact-inquiries", async (
        ContactInquiryRequest request,
        HttpContext httpContext,
        IContactInquiryWriter inquiryWriter,
        CancellationToken cancellationToken) =>
    {
        var validationResults = new List<ValidationResult>();
        var validationContext = new ValidationContext(request);
        if (!Validator.TryValidateObject(request, validationContext, validationResults, validateAllProperties: true))
        {
            var errors = validationResults
                .SelectMany(result => result.MemberNames.Select(member => new { member, result.ErrorMessage }))
                .GroupBy(item => item.member)
                .ToDictionary(group => group.Key, group => group.Select(item => item.ErrorMessage ?? "Invalid value.").ToArray());
            return Results.ValidationProblem(errors);
        }

        if (!string.IsNullOrWhiteSpace(request.BotField))
        {
            return Results.Accepted();
        }

        var inquiry = ContactInquiry.Create(
            request.FirstName!,
            request.LastName!,
            request.Email!,
            request.Phone,
            request.Service!,
            request.Message,
            httpContext.Connection.RemoteIpAddress?.ToString());

        await inquiryWriter.SaveAsync(inquiry, cancellationToken);
        return Results.Json(new { inquiry.Id, inquiry.CreatedAtUtc }, statusCode: StatusCodes.Status201Created);
    })
    .WithName("CreateContactInquiry")
    .WithApiVersionSet(apiVersionSet)
    .MapToApiVersion(new ApiVersion(1, 0))
    .RequireRateLimiting("public-contact");

app.MapHealthChecks("/health/ready", new HealthCheckOptions());
app.Run();

public partial class Program { }

public sealed record ContactInquiryRequest
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
}
