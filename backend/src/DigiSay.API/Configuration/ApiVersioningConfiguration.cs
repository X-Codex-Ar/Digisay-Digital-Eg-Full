using Asp.Versioning;

namespace DigiSay.API.Configuration;

internal static class ApiVersioningConfiguration
{
    public static IServiceCollection AddDigiSayApiVersioning(this IServiceCollection services)
    {
        services.AddApiVersioning(options =>
        {
            options.DefaultApiVersion = new ApiVersion(1, 0);
            options.AssumeDefaultVersionWhenUnspecified = false;
            options.ReportApiVersions = true;
            options.ApiVersionReader = new UrlSegmentApiVersionReader();
        });

        return services;
    }
}
