using System.Net.Mail;
using System.Text;
using Asp.Versioning;
using DigiSay.API.Authentication;
using DigiSay.API.Endpoints;
using DigiSay.API.Endpoints.Crm;
using DigiSay.API.Endpoints.Organizations;
using DigiSay.API.Endpoints.Storage;
using DigiSay.Application;
using DigiSay.Infrastructure;
using DigiSay.Infrastructure.Identity;
using DigiSay.Infrastructure.Persistence;
using DigiSay.API.Configuration;
using DigiSay.API.RateLimiting;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.HttpOverrides;

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
builder.Services.Configure<ForwardedHeadersOptions>(options =>
    ForwardedHeadersConfiguration.Configure(options, builder.Configuration));
builder.Services.AddOptions<RateLimitKeyOptions>()
    .Bind(builder.Configuration.GetSection(RateLimitKeyOptions.SectionName))
    .Configure(options =>
    {
        if (builder.Environment.IsDevelopment() && string.IsNullOrWhiteSpace(options.KeyHashSecret))
        {
            options.KeyHashSecret = "development-only-rate-limit-key-hash-secret";
        }
    })
    .Validate(options => Encoding.UTF8.GetByteCount(options.KeyHashSecret) >= 32,
        "RateLimiting:KeyHashSecret must contain at least 32 UTF-8 bytes.")
    .ValidateOnStart();
builder.Services.AddRateLimitStore(builder.Configuration, builder.Environment.IsDevelopment());
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = false;
    options.ReportApiVersions = true;
    options.ApiVersionReader = new UrlSegmentApiVersionReader();
});
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddIdentityApiEndpoints<DigiSayUser>(options =>
    {
        options.User.RequireUniqueEmail = true;
        options.SignIn.RequireConfirmedEmail = true;
        options.Password.RequiredLength = 12;
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
        options.Lockout.AllowedForNewUsers = true;
    })
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<DigiSayDbContext>();
builder.Services.Configure<BearerTokenOptions>(options =>
{
    options.BearerTokenExpiration = TimeSpan.FromMinutes(15);
    options.RefreshTokenExpiration = TimeSpan.FromDays(7);
});
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminAccess", policy =>
        policy.RequireRole(DigiSayRoles.SuperAdmin, DigiSayRoles.Admin, DigiSayRoles.Manager));
    options.AddPolicy("ClientAccess", policy => policy.RequireRole(DigiSayRoles.Client));
});

var smtpConfigured = !string.IsNullOrWhiteSpace(
    builder.Configuration[$"{SmtpEmailOptions.SectionName}:Host"]);
if (builder.Environment.IsDevelopment() && !smtpConfigured)
{
    builder.Services.AddTransient<IEmailSender<DigiSayUser>, DevelopmentIdentityEmailSender>();
}
else
{
    builder.Services.AddOptions<SmtpEmailOptions>()
        .Bind(builder.Configuration.GetSection(SmtpEmailOptions.SectionName))
        .Validate(options => !string.IsNullOrWhiteSpace(options.Host), "Email:Smtp:Host is required.")
        .Validate(options => options.Port is > 0 and <= 65535, "Email:Smtp:Port must be a valid TCP port.")
        .Validate(options => !string.IsNullOrWhiteSpace(options.UserName), "Email:Smtp:UserName is required.")
        .Validate(options => !string.IsNullOrWhiteSpace(options.Password), "Email:Smtp:Password is required.")
        .Validate(options => MailAddress.TryCreate(options.FromAddress, out _), "Email:Smtp:FromAddress must be a valid email address.")
        .ValidateOnStart();
    builder.Services.AddTransient<IEmailSender<DigiSayUser>, SmtpIdentityEmailSender>();
}

var app = builder.Build();
app.UseExceptionHandler();
app.UseForwardedHeaders();
app.UseCors("frontends");
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
