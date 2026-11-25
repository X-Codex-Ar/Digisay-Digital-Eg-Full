using Microsoft.AspNetCore.Identity;

namespace DigiSay.API.Configuration;

internal static class SecurityStampConfiguration
{
    public static IServiceCollection AddDigiSaySecurityStampValidation(this IServiceCollection services)
    {
        services.Configure<SecurityStampValidatorOptions>(options =>
            options.ValidationInterval = TimeSpan.FromMinutes(5));

        return services;
    }
}
