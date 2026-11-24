using DigiSay.Application.ContactInquiries;
using DigiSay.Domain;
using DigiSay.Infrastructure.Identity;
using DigiSay.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Hosting;
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
        });
    }

    public async Task InitializeDatabaseAsync()
    {
        using var scope = Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<DigiSayDbContext>();
        await dbContext.Database.EnsureCreatedAsync();
    }

    public async Task ConfirmEmailAsync(string email)
    {
        using var scope = Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<DigiSayUser>>();
        var user = await userManager.FindByEmailAsync(email)
            ?? throw new InvalidOperationException("Test user was not created.");
        user.EmailConfirmed = true;
        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException("Test user email could not be confirmed.");
        }
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
