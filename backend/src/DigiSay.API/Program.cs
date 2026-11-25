using System.Net.Mail;
using System.Text;
using Asp.Versioning;
using DigiSay.API.Authentication;
using DigiSay.API.Endpoints;
using DigiSay.API.Endpoints.Crm;
using DigiSay.API.Endpoints.Organizations;
using DigiSay.API.Endpoints.Storage;
using DigiSay.API.Endpoints.Reports;
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
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var dataProtectionKeysPath = builder.Configuration["DataProtection:KeysPath"];
if (!string.IsNullOrWhiteSpace(dataProtectionKeysPath))
{
    Directory.CreateDirectory(dataProtectionKeysPath);
    builder.Services.AddDataProtection()
        .PersistKeysToFileSystem(new DirectoryInfo(dataProtectionKeysPath));
}

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
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment.IsDevelopment());
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
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
        ? CookieSecurePolicy.SameAsRequest
        : CookieSecurePolicy.Always;
});
builder.Services.AddScoped<SignInManager<DigiSayUser>, RefreshTokenRotationSignInManager>();
builder.Services.AddOptions<IdentityBootstrapOptions>()
    .Bind(builder.Configuration.GetSection(IdentityBootstrapOptions.SectionName))
    .Validate(options => string.IsNullOrEmpty(options.BootstrapAdminSecret) ||
        System.Text.Encoding.UTF8.GetByteCount(options.BootstrapAdminSecret) >= 32,
        "Identity:BootstrapAdminSecret must contain at least 32 UTF-8 bytes when configured.")
    .ValidateOnStart();
builder.Services.Configure<BearerTokenOptions>(options =>
{
    options.BearerTokenExpiration = TimeSpan.FromMinutes(15);
    options.RefreshTokenExpiration = TimeSpan.FromDays(7);
});
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("SuperAdminAccess", policy => policy.RequireRole(DigiSayRoles.SuperAdmin));
    options.AddPolicy("AdminAccess", policy =>
        policy.RequireRole(DigiSayRoles.SuperAdmin, DigiSayRoles.Admin, DigiSayRoles.Manager));
    options.AddPolicy("ClientAccess", policy => policy.RequireRole(DigiSayRoles.Client));
    options.AddPolicy("AdminOrClientAccess", policy =>
        policy.RequireRole(DigiSayRoles.SuperAdmin, DigiSayRoles.Admin, DigiSayRoles.Manager, DigiSayRoles.Client));
});
builder.Services.Configure<SecurityStampValidatorOptions>(options =>
    options.ValidationInterval = TimeSpan.FromMinutes(5));

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

if (app.Environment.IsDevelopment() &&
    app.Configuration.GetValue<bool>("Database:ApplyMigrationsOnStartup"))
{
    await using var scope = app.Services.CreateAsyncScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<DigiSayDbContext>();
    await dbContext.Database.MigrateAsync();
}

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
app.MapReportEndpoints(apiVersionSet);
app.MapHealthChecks("/health/ready", new HealthCheckOptions()).AllowAnonymous();
app.Run();

public partial class Program { }
