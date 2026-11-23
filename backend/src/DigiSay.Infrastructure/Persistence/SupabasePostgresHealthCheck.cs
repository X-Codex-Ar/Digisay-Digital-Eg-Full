using Microsoft.Extensions.Diagnostics.HealthChecks;
using Npgsql;

namespace DigiSay.Infrastructure.Persistence;

internal sealed class SupabasePostgresHealthCheck(NpgsqlDataSource dataSource) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
            await using var command = new NpgsqlCommand("SELECT 1", connection);
            await command.ExecuteScalarAsync(cancellationToken);
            return HealthCheckResult.Healthy("Supabase Postgres is reachable.");
        }
        catch (Exception exception)
        {
            return HealthCheckResult.Unhealthy("Supabase Postgres is unavailable.", exception);
        }
    }
}
