using DigiSay.Application.Features.Content;
using DigiSay.Application.Features.Content.Abstractions;
using DigiSay.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace DigiSay.Infrastructure.Tests;

public sealed class DevelopmentStorageFallbackTests
{
    [Fact]
    public async Task Missing_supabase_storage_in_development_disables_storage_without_blocking_api_startup()
    {
        var configuration = CreateConfiguration();
        var services = new ServiceCollection();

        services.AddInfrastructure(configuration, isDevelopment: true);
        using var provider = services.BuildServiceProvider();
        var storage = provider.GetRequiredService<IPrivateObjectStorage>();

        var exception = await Assert.ThrowsAsync<StorageProviderException>(() =>
            storage.UploadAsync(Guid.NewGuid(), Guid.NewGuid(), Stream.Null, "application/octet-stream", CancellationToken.None));

        Assert.Equal(503, exception.StatusCode);
    }

    [Fact]
    public void Missing_supabase_storage_outside_development_fails_fast()
    {
        var configuration = CreateConfiguration();
        var services = new ServiceCollection();

        var exception = Assert.Throws<InvalidOperationException>(() =>
            services.AddInfrastructure(configuration, isDevelopment: false));

        Assert.Contains("Storage:Supabase", exception.Message, StringComparison.Ordinal);
    }

    private static IConfiguration CreateConfiguration() =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:SqlServer"] = "Server=(local);Database=DigiSayTests;Trusted_Connection=True;TrustServerCertificate=True",
            })
            .Build();
}
