using DigiSay.API.Authentication;
using DigiSay.Infrastructure.Identity;
using DigiSay.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;

namespace DigiSay.API.Configuration;

internal static class IdentityConfiguration
{
    public static IServiceCollection AddDigiSayIdentity(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddIdentityApiEndpoints<DigiSayUser>(options =>
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

        services.AddScoped<SignInManager<DigiSayUser>, RefreshTokenRotationSignInManager>();

        services.AddOptions<IdentityBootstrapOptions>()
            .Bind(configuration.GetSection(IdentityBootstrapOptions.SectionName))
            .Validate(options => string.IsNullOrEmpty(options.BootstrapAdminSecret) ||
                System.Text.Encoding.UTF8.GetByteCount(options.BootstrapAdminSecret) >= 32,
                "Identity:BootstrapAdminSecret must contain at least 32 UTF-8 bytes when configured.")
            .ValidateOnStart();

        return services;
    }
}
