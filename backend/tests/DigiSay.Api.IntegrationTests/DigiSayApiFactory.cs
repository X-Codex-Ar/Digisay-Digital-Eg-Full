using DigiSay.Application.ContactInquiries;
using DigiSay.Domain;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DigiSay.Api.IntegrationTests;

internal sealed class DigiSayApiFactory : WebApplicationFactory<Program>
{
    public RecordingContactInquiryWriter Writer { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((_, configuration) => configuration.AddInMemoryCollection(
            new Dictionary<string, string?>
            {
                ["ConnectionStrings:SqlServer"] = "Server=localhost;Database=DigiSayTests;User Id=test;Password=test;TrustServerCertificate=True",
            }));

        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<IContactInquiryWriter>();
            services.AddSingleton<IContactInquiryWriter>(Writer);
        });
    }
}

internal sealed class RecordingContactInquiryWriter : IContactInquiryWriter
{
    private readonly List<ContactInquiry> _saved = [];

    public IReadOnlyList<ContactInquiry> Saved => _saved;

    public Task SaveAsync(ContactInquiry inquiry, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        _saved.Add(inquiry);
        return Task.CompletedTask;
    }
}
