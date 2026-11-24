using System.Net.Mail;
using System.Threading.RateLimiting;
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
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Identity;

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
    options.AddPolicy("identity-auth", context =>
    {
        var path = context.Request.Path.Value ?? string.Empty;
        var isCredentialEndpoint = path.EndsWith("/register", StringComparison.OrdinalIgnoreCase)
            || path.EndsWith("/login", StringComparison.OrdinalIgnoreCase)
            || path.EndsWith("/forgotPassword", StringComparison.OrdinalIgnoreCase)
            || path.EndsWith("/resetPassword", StringComparison.OrdinalIgnoreCase)
            || path.EndsWith("/resendConfirmationEmail", StringComparison.OrdinalIgnoreCase);
        var category = isCredentialEndpoint ? "credentials" : path;

        return RateLimitPartition.GetFixedWindowLimiter(
            $"{context.Connection.RemoteIpAddress?.ToString() ?? "unknown"}:{category}",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = isCredentialEndpoint ? 10 : 60,
                Window = TimeSpan.FromMinutes(10),
                QueueLimit = 0,
                AutoReplenishment = true,
            });
    });
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
app.UseCors("frontends");
app.UseAuthentication();
app.UseAuthorization();
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
app.MapOrganizationEndpoints(apiVersionSet);
app.MapCrmEndpoints(apiVersionSet);
app.MapStorageEndpoints(apiVersionSet);
app.MapHealthChecks("/health/ready", new HealthCheckOptions()).AllowAnonymous();
app.Run();

public partial class Program { }
