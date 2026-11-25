namespace DigiSay.API.Configuration;

internal static class CookieConfiguration
{
    public static IServiceCollection AddDigiSayApplicationCookie(
        this IServiceCollection services,
        IHostEnvironment environment)
    {
        services.ConfigureApplicationCookie(options =>
        {
            options.Cookie.HttpOnly = true;
            options.Cookie.SameSite = SameSiteMode.Strict;
            options.Cookie.SecurePolicy = environment.IsDevelopment()
                ? CookieSecurePolicy.SameAsRequest
                : CookieSecurePolicy.Always;
        });

        return services;
    }
}
