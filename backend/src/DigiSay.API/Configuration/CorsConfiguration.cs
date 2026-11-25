namespace DigiSay.API.Configuration;

internal static class CorsConfiguration
{
    public const string PolicyName = "frontends";

    public static IServiceCollection AddDigiSayCors(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddCors(options =>
        {
            var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ??
                ["http://localhost:3000", "http://localhost:4200", "http://localhost:5173", "http://localhost:8080"];

            options.AddPolicy(PolicyName, policy =>
                policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod());
        });

        return services;
    }
}
