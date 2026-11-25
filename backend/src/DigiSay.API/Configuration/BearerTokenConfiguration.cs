using Microsoft.AspNetCore.Authentication.BearerToken;

namespace DigiSay.API.Configuration;

internal static class BearerTokenConfiguration
{
    public static IServiceCollection AddDigiSayBearerTokens(this IServiceCollection services)
    {
        services.Configure<BearerTokenOptions>(options =>
        {
            options.BearerTokenExpiration = TimeSpan.FromMinutes(15);
            options.RefreshTokenExpiration = TimeSpan.FromDays(7);
        });

        return services;
    }
}
