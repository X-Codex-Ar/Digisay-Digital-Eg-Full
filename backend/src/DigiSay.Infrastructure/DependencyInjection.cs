using DigiSay.Application.Features.ContactInquiries;
using DigiSay.Application.Features.CRM.Leads.Abstractions;
using DigiSay.Application.Features.CRM.ServiceRequests.Abstractions;
using DigiSay.Application.Features.Organizations.Abstractions;
using DigiSay.Infrastructure.Persistence;
using DigiSay.Infrastructure.Integrations.Supabase;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
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
