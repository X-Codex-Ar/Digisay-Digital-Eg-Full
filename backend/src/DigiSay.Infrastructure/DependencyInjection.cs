using DigiSay.Application.Features.ContactInquiries;
using DigiSay.Application.Features.CRM.Leads.Abstractions;
using DigiSay.Application.Features.CRM.ServiceRequests.Abstractions;
using DigiSay.Application.Features.Organizations.Abstractions;
using DigiSay.Application.Features.Content.Abstractions;
using DigiSay.Application.Features.Content;
using DigiSay.Application.Common.RateLimiting;
using DigiSay.Infrastructure.Persistence;
using DigiSay.Infrastructure.Integrations.Supabase;
using DigiSay.Infrastructure.Storage;
using DigiSay.Infrastructure.Storage.Supabase;
using DigiSay.Infrastructure.RateLimiting;
using DigiSay.Infrastructure.AI;
using DigiSay.Infrastructure.Outbox;
using DigiSay.Application.Features.AI.PublicAssistant;
using DigiSay.Application.Features.AI.ServiceRequestTriage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Npgsql;
using StackExchange.Redis;

namespace DigiSay.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration,
        bool isDevelopment = false)
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
        services.AddScoped<IStorageObjectStore, StorageObjectStore>();
        services.AddScoped<CrmStore>();
        services.AddScoped<ILeadStore>(provider => provider.GetRequiredService<CrmStore>());
        services.AddScoped<IServiceRequestStore>(provider => provider.GetRequiredService<CrmStore>());
        services.AddScoped<IOutboxStore, SqlOutboxStore>();
        // Keep events durable in SQL until an idempotent destination publisher is configured.
        // Do not register the dispatcher with a logging-only publisher: logging is not delivery.

        services.AddOptions<PublicAssistantOptions>()
            .Bind(configuration.GetSection(PublicAssistantOptions.SectionName));
        services.AddOptions<OpenAiProviderOptions>()
            .Bind(configuration.GetSection(OpenAiProviderOptions.SectionName))
            .Validate(options => !options.Enabled ||
                (Uri.TryCreate(options.Endpoint, UriKind.Absolute, out var endpoint) &&
                    endpoint.Scheme == Uri.UriSchemeHttps &&
                    string.Equals(endpoint.Host, "api.openai.com", StringComparison.OrdinalIgnoreCase) &&
                    endpoint.AbsolutePath == "/v1/responses" &&
                    string.IsNullOrEmpty(endpoint.UserInfo) &&
                    string.IsNullOrEmpty(endpoint.Query) &&
                    string.IsNullOrEmpty(endpoint.Fragment) &&
                    !string.IsNullOrWhiteSpace(options.Model) &&
                    !string.IsNullOrWhiteSpace(options.ApiKey) &&
                    options.TimeoutSeconds is >= 2 and <= 30 &&
                    options.MaximumOutputTokens is >= 1 and <= 1_000),
                "Enabled OpenAI settings must use the HTTPS Responses API endpoint, a model, a server-side API key, and bounded timeout/output limits.")
            .ValidateOnStart();
        services.AddSingleton<IPublicFaqSearchTool, PublicFaqSearchTool>();
        services.AddSingleton<IServiceRequestTriageDataMinimizer, ServiceRequestTriageDataMinimizer>();
        services.AddScoped<IServiceRequestTriageProvider, LanguageModelServiceRequestTriageProvider>();
        services.AddHttpClient<ILanguageModelProvider, OpenAiResponsesLanguageModelProvider>((provider, client) =>
            {
                var providerOptions = provider.GetRequiredService<IOptions<OpenAiProviderOptions>>().Value;
                client.Timeout = TimeSpan.FromSeconds(Math.Clamp(providerOptions.TimeoutSeconds, 2, 30));
            })
            .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler { AllowAutoRedirect = false });

        var supabaseStorageSection = configuration.GetSection(SupabaseStorageOptions.SectionName);
        var storageProjectUrl = supabaseStorageSection[nameof(SupabaseStorageOptions.ProjectUrl)];
        var storageSecretKey = supabaseStorageSection[nameof(SupabaseStorageOptions.SecretKey)];
        if (string.IsNullOrWhiteSpace(storageProjectUrl) && string.IsNullOrWhiteSpace(storageSecretKey))
        {
            if (!isDevelopment)
            {
                throw new InvalidOperationException(
                    "Storage:Supabase:ProjectUrl and Storage:Supabase:SecretKey must be configured outside Development.");
            }

            services.AddSingleton<IPrivateObjectStorage, UnavailablePrivateObjectStorage>();
        }
        else
        {
            services.AddOptions<SupabaseStorageOptions>()
                .Bind(supabaseStorageSection)
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
        }

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

    public static IServiceCollection AddRateLimitStore(
        this IServiceCollection services,
        IConfiguration configuration,
        bool isDevelopment)
    {
        var redisConnection = configuration["RateLimiting:RedisConnectionString"];
        if (string.IsNullOrWhiteSpace(redisConnection))
        {
            if (!isDevelopment)
            {
                throw new InvalidOperationException(
                    "RateLimiting:RedisConnectionString must be configured outside Development.");
            }

            services.AddSingleton<IRateLimitStore, InMemoryRateLimitStore>();
            return services;
        }

        services.AddSingleton<IConnectionMultiplexer>(_ =>
        {
            var redisOptions = ConfigurationOptions.Parse(redisConnection);
            redisOptions.AbortOnConnectFail = false;
            return ConnectionMultiplexer.Connect(redisOptions);
        });
        services.AddSingleton<IRateLimitStore, RedisRateLimitStore>();
        return services;
    }
}
