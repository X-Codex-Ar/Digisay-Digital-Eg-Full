using DigiSay.Infrastructure.Identity;

namespace DigiSay.API.Configuration;

internal static class AuthorizationConfiguration
{
    public static IServiceCollection AddDigiSayAuthorization(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            options.AddPolicy("SuperAdminAccess", policy => policy.RequireRole(DigiSayRoles.SuperAdmin));
            options.AddPolicy("AdminAccess", policy =>
                policy.RequireRole(DigiSayRoles.SuperAdmin, DigiSayRoles.Admin, DigiSayRoles.Manager));
            options.AddPolicy("ClientAccess", policy => policy.RequireRole(DigiSayRoles.Client));
            options.AddPolicy("AdminOrClientAccess", policy =>
                policy.RequireRole(DigiSayRoles.SuperAdmin, DigiSayRoles.Admin, DigiSayRoles.Manager, DigiSayRoles.Client));
        });

        return services;
    }
}
