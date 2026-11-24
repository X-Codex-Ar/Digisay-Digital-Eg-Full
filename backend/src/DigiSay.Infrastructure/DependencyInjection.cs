using DigiSay.Application.Features.ContactInquiries;
using DigiSay.Application.Features.CRM.Leads.Abstractions;
using DigiSay.Application.Features.CRM.ServiceRequests.Abstractions;
using DigiSay.Application.Features.Organizations.Abstractions;
using DigiSay.Application.Features.Content.Abstractions;
using DigiSay.Infrastructure.Persistence;
using DigiSay.Infrastructure.Integrations.Supabase;
using DigiSay.Infrastructure.Storage.Supabase;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Npgsql;

namespace DigiSay.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("SqlServer");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "ConnectionStrings:SqlServer must be configured before the API starts.");
        }

        services.AddDbContext<DigiSayDbContext>(options =>
            options.UseSqlServer(connectionString, sql =>
                sql.EnableRetryOnFailure(maxRetryCount: 3)));
        services.AddScoped<IContactInquiryWriter, SqlContactInquiryWriter>();
        services.AddScoped<IOrganizationStore, OrganizationStore>();
        services.AddScoped<CrmStore>();
        services.AddScoped<ILeadStore>(provider => provider.GetRequiredService<CrmStore>());
        services.AddScoped<IServiceRequestStore>(provider => provider.GetRequiredService<CrmStore>());

        services.AddOptions<SupabaseStorageOptions>()
            .Bind(configuration.GetSection(SupabaseStorageOptions.SectionName))
            .Validate(options => Uri.TryCreate(options.ProjectUrl, UriKind.Absolute, out var uri) &&
                uri.Scheme == Uri.UriSchemeHttps && uri.AbsolutePath == "/" && string.IsNullOrEmpty(uri.Query) && string.IsNullOrEmpty(uri.Fragment),
                "Storage:Supabase:ProjectUrl must be a root HTTPS project URL.")
            .Validate(options => !string.IsNullOrWhiteSpace(options.SecretKey), "Storage:Supabase:SecretKey is required.")
            .Validate(options => !string.IsNullOrWhiteSpace(options.PrivateBucket) &&
                options.PrivateBucket.Length <= 100 && options.PrivateBucket.All(character => char.IsAsciiLetterOrDigit(character) || character is '-' or '_'),
                "Storage:Supabase:PrivateBucket must be a valid bucket identifier.")
            .ValidateOnStart();

        services.AddHttpClient<IPrivateObjectStorage, SupabaseStorageAdapter>((provider, client) =>
            {
                var storageOptions = provider.GetRequiredService<IOptions<SupabaseStorageOptions>>().Value;
                client.BaseAddress = new Uri(storageOptions.ProjectUrl.TrimEnd('/') + "/storage/v1/");
                client.Timeout = TimeSpan.FromSeconds(30);
            })
            .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler { AllowAutoRedirect = false });

        var healthChecks = services.AddHealthChecks().AddDbContextCheck<DigiSayDbContext>("sqlserver");

        var supabaseConnectionString = configuration.GetConnectionString("SupabasePostgres");
        if (!string.IsNullOrWhiteSpace(supabaseConnectionString))
        {
            var postgresBuilder = new NpgsqlConnectionStringBuilder(supabaseConnectionString)
            {
                SslMode = SslMode.Require,
                Timeout = 15,
                CommandTimeout = 15,
                MaxPoolSize = 5,
            };
            var dataSource = NpgsqlDataSource.Create(postgresBuilder.ConnectionString);
            services.AddSingleton(dataSource);
            healthChecks.AddCheck<SupabasePostgresHealthCheck>("supabase-postgres");
        }

        return services;
    }
}
