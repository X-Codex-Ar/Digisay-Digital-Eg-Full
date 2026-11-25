using Asp.Versioning;
using DigiSay.API.Configuration;
using DigiSay.API.Endpoints;
using DigiSay.API.Endpoints.Crm;
using DigiSay.API.Endpoints.Organizations;
using DigiSay.API.Endpoints.Storage;
using DigiSay.Application;
using DigiSay.Infrastructure;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
builder.Services.AddDigiSayCors(builder.Configuration);
builder.Services.AddDigiSayForwardedHeaders(builder.Configuration);
builder.Services.AddDigiSayRateLimiting(builder.Configuration, builder.Environment);
builder.Services.AddDigiSayApiVersioning();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddDigiSayIdentity(builder.Configuration);
builder.Services.AddDigiSayApplicationCookie(builder.Environment);
builder.Services.AddDigiSayBearerTokens();
builder.Services.AddDigiSayAuthorization();
builder.Services.AddDigiSaySecurityStampValidation();
builder.Services.AddDigiSayEmail(builder.Configuration, builder.Environment);

var app = builder.Build();
app.UseExceptionHandler();
app.UseForwardedHeaders();
app.UseCors(CorsConfiguration.PolicyName);
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

var apiVersionSet = app.NewApiVersionSet()
    .HasApiVersion(new ApiVersion(1, 0))
    .ReportApiVersions()
    .Build();

app.MapApiEndpoints(apiVersionSet);
app.MapOrganizationEndpoints(apiVersionSet);
app.MapCrmEndpoints(apiVersionSet);
app.MapStorageEndpoints(apiVersionSet);
app.MapHealthChecks("/health/ready", new HealthCheckOptions()).AllowAnonymous();
app.Run();

public partial class Program { }
