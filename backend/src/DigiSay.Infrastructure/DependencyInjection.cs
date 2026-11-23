using DigiSay.Application.ContactInquiries;
using DigiSay.Infrastructure.Persistence;
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
