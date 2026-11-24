using Asp.Versioning;
using DigiSay.Api.Endpoints;
using DigiSay.Application;
using DigiSay.Infrastructure;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
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
builder.Services.AddApplication();
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

app.MapApiEndpoints(apiVersionSet);
app.MapHealthChecks("/health/ready", new HealthCheckOptions());
app.Run();

public partial class Program { }
