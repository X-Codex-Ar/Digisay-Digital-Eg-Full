using System.Net.Mail;
using DigiSay.API.Authentication;
using DigiSay.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;

namespace DigiSay.API.Configuration;

internal static class EmailConfiguration
{
    public static IServiceCollection AddDigiSayEmail(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        var smtpConfigured = !string.IsNullOrWhiteSpace(
            configuration[$"{SmtpEmailOptions.SectionName}:Host"]);

        if (environment.IsDevelopment() && !smtpConfigured)
        {
            services.AddTransient<IEmailSender<DigiSayUser>, DevelopmentIdentityEmailSender>();
            return services;
        }

        services.AddOptions<SmtpEmailOptions>()
            .Bind(configuration.GetSection(SmtpEmailOptions.SectionName))
            .Validate(options => !string.IsNullOrWhiteSpace(options.Host), "Email:Smtp:Host is required.")
            .Validate(options => options.Port is > 0 and <= 65535, "Email:Smtp:Port must be a valid TCP port.")
            .Validate(options => !string.IsNullOrWhiteSpace(options.UserName), "Email:Smtp:UserName is required.")
            .Validate(options => !string.IsNullOrWhiteSpace(options.Password), "Email:Smtp:Password is required.")
            .Validate(options => MailAddress.TryCreate(options.FromAddress, out _), "Email:Smtp:FromAddress must be a valid email address.")
            .ValidateOnStart();

        services.AddTransient<IEmailSender<DigiSayUser>, SmtpIdentityEmailSender>();
        return services;
    }
}
