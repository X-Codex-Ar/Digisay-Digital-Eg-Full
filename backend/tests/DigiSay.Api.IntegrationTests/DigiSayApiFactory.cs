using System.Collections.Concurrent;
using System.Net;
using DigiSay.Application.ContactInquiries;
using DigiSay.Domain;
using DigiSay.Infrastructure.Identity;
using DigiSay.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DigiSay.Api.IntegrationTests;

internal sealed class DigiSayApiFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection = new("Data Source=:memory:");

    public RecordingIdentityEmailSender EmailSender { get; } = new();

    public RecordingContactInquiryWriter Writer { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        _connection.Open();
        builder.UseSetting(
            "ConnectionStrings:SqlServer",
            "Server=localhost;Database=DigiSayTests;User Id=test;Password=test;TrustServerCertificate=True");

        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<DigiSayDbContext>();
            services.AddScoped(_ => new DigiSayDbContext(
                new DbContextOptionsBuilder<DigiSayDbContext>()
                    .UseSqlite(_connection)
                    .Options));
            services.RemoveAll<IContactInquiryWriter>();
            services.AddSingleton<IContactInquiryWriter>(Writer);
            services.RemoveAll<IEmailSender<DigiSayUser>>();
            services.AddSingleton<IEmailSender<DigiSayUser>>(EmailSender);
        });
    }

    public async Task InitializeDatabaseAsync()
    {
        using var scope = Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<DigiSayDbContext>();
        await dbContext.Database.EnsureCreatedAsync();
    }

    public async Task<HttpResponseMessage> ConfirmEmailAsync(HttpClient client, string email)
    {
        var confirmationLink = EmailSender.GetConfirmationLink(email);
        var confirmationUri = new Uri(WebUtility.HtmlDecode(confirmationLink));
        return await client.GetAsync(confirmationUri.PathAndQuery);
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _connection.Dispose();
        }

        base.Dispose(disposing);
    }
}

internal sealed class RecordingIdentityEmailSender : IEmailSender<DigiSayUser>
{
    private readonly ConcurrentDictionary<string, string> _confirmationLinks = new(
        StringComparer.OrdinalIgnoreCase);

    public Task SendConfirmationLinkAsync(DigiSayUser user, string email, string confirmationLink)
    {
        _confirmationLinks[email] = confirmationLink;
        return Task.CompletedTask;
    }

    public string GetConfirmationLink(string email) =>
        _confirmationLinks.TryGetValue(email, out var link)
            ? link
            : throw new InvalidOperationException("No confirmation link was generated for the test user.");

    public Task SendPasswordResetLinkAsync(DigiSayUser user, string email, string resetLink) => Task.CompletedTask;

    public Task SendPasswordResetCodeAsync(DigiSayUser user, string email, string resetCode) => Task.CompletedTask;
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
