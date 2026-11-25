using System.Text;
using DigiSay.API.RateLimiting;
using DigiSay.Infrastructure;

namespace DigiSay.API.Configuration;

internal static class RateLimitingConfiguration
{
    public static IServiceCollection AddDigiSayRateLimiting(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        services.AddOptions<RateLimitKeyOptions>()
            .Bind(configuration.GetSection(RateLimitKeyOptions.SectionName))
            .Configure(options =>
            {
                if (environment.IsDevelopment() && string.IsNullOrWhiteSpace(options.KeyHashSecret))
                {
                    options.KeyHashSecret = "development-only-rate-limit-key-hash-secret";
                }
            })
            .Validate(options => Encoding.UTF8.GetByteCount(options.KeyHashSecret) >= 32,
                "RateLimiting:KeyHashSecret must contain at least 32 UTF-8 bytes.")
            .ValidateOnStart();

        services.AddRateLimitStore(configuration, environment.IsDevelopment());
        return services;
    }
}
