using System.Net;
using Microsoft.AspNetCore.HttpOverrides;

namespace DigiSay.API.Configuration;

internal static class ForwardedHeadersConfiguration
{
    public static IServiceCollection AddDigiSayForwardedHeaders(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<ForwardedHeadersOptions>(options => Configure(options, configuration));
        return services;
    }

    private static void Configure(ForwardedHeadersOptions options, IConfiguration configuration)
    {
        options.ForwardedHeaders = ForwardedHeaders.None;
        options.ForwardLimit = configuration.GetValue<int?>("ForwardedHeaders:ForwardLimit") ?? 1;
        if (options.ForwardLimit is < 1 or > 10)
        {
            throw new InvalidOperationException("ForwardedHeaders:ForwardLimit must be between 1 and 10.");
        }

        options.KnownProxies.Clear();
        options.KnownIPNetworks.Clear();
        foreach (var value in configuration.GetSection("ForwardedHeaders:KnownProxies").Get<string[]>() ?? [])
        {
            if (!IPAddress.TryParse(value, out var address))
            {
                throw new InvalidOperationException("ForwardedHeaders:KnownProxies contains an invalid IP address.");
            }

            options.KnownProxies.Add(address);
        }

        foreach (var value in configuration.GetSection("ForwardedHeaders:KnownNetworks").Get<string[]>() ?? [])
        {
            if (!System.Net.IPNetwork.TryParse(value, out var network))
            {
                throw new InvalidOperationException("ForwardedHeaders:KnownNetworks contains an invalid CIDR network.");
            }

            options.KnownIPNetworks.Add(network);
        }

        if (options.KnownProxies.Count > 0 || options.KnownIPNetworks.Count > 0)
        {
            options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
        }
    }
}
