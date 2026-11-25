using System.Collections.Concurrent;
using System.Net;
using DigiSay.Application.Features.AI.PublicAssistant;
using DigiSay.Application.Common.Organizations;
using DigiSay.Application.Features.ContactInquiries;
using DigiSay.Application.Features.Content;
using DigiSay.Application.Features.Content.Abstractions;
using DigiSay.Application.Common.RateLimiting;
using DigiSay.Domain.Entities;
using DigiSay.Domain.Enums;
using DigiSay.Infrastructure.Identity;
using DigiSay.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;

namespace DigiSay.API.IntegrationTests;

internal sealed class DigiSayApiFactory : WebApplicationFactory<Program>
{
    private readonly string _databaseName = $"DigiSayIntegrationTests_{Guid.NewGuid():N}";

    internal string TestConnectionString
    {
        get
        {
            var configuredConnectionString = Environment.GetEnvironmentVariable("TEST_SQLSERVER_CONNECTION_STRING");
            if (string.IsNullOrWhiteSpace(configuredConnectionString))
            {
                throw new InvalidOperationException(
                    "Set TEST_SQLSERVER_CONNECTION_STRING to a disposable SQL Server test instance.");
            }

            var connectionString = new SqlConnectionStringBuilder(configuredConnectionString)
            {
                InitialCatalog = _databaseName,
            };
            return connectionString.ConnectionString;
        }
    }

    public RecordingIdentityEmailSender EmailSender { get; } = new();
    public RecordingPublicFaqSearchTool PublicFaqSearch { get; } = new();
    public RecordingLanguageModelProvider LanguageModel { get; } = new();
    public DigiSayApiFactory(
        bool rateLimitStoreUnavailable = false,
        bool trustLoopbackProxy = false,
        string? identityBootstrapSecret = null,
        bool publicAssistantEnabled = false)
    {
        RateLimitStoreUnavailable = rateLimitStoreUnavailable;
        TrustLoopbackProxy = trustLoopbackProxy;
        IdentityBootstrapSecret = identityBootstrapSecret;
        PublicAssistantEnabled = publicAssistantEnabled;
    }

    private bool RateLimitStoreUnavailable { get; }
    private bool TrustLoopbackProxy { get; }
    private string? IdentityBootstrapSecret { get; }
    private bool PublicAssistantEnabled { get; }

    public RecordingContactInquiryWriter Writer { get; } = new();
    public RecordingPrivateObjectStorage Storage { get; } = new();
    public ConcurrentQueue<string> Logs { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        var connectionString = TestConnectionString;
        builder.ConfigureLogging(logging => logging.AddProvider(new RecordingLoggerProvider(Logs)));
        builder.UseSetting(
            "ConnectionStrings:SqlServer",
            connectionString);
        builder.UseSetting("Storage:Supabase:ProjectUrl", "https://storage.example.test");
        builder.UseSetting("Storage:Supabase:SecretKey", "test-only-server-secret");
        builder.UseSetting("Storage:Supabase:PrivateBucket", "digisay-private");
        builder.UseSetting("AI:PublicAssistant:Enabled", PublicAssistantEnabled.ToString());
        if (IdentityBootstrapSecret is not null)
        {
            builder.UseSetting("Identity:BootstrapAdminSecret", IdentityBootstrapSecret);
        }
        if (TrustLoopbackProxy)
        {
            builder.UseSetting("ForwardedHeaders:KnownProxies:0", "127.0.0.1");
            builder.UseSetting("ForwardedHeaders:KnownProxies:1", "::1");
        }

        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<DigiSayDbContext>();
            services.AddScoped(serviceProvider => new DigiSayDbContext(
                new DbContextOptionsBuilder<DigiSayDbContext>()
                    .UseSqlServer(connectionString)
                    .Options,
                serviceProvider.GetRequiredService<IOrganizationContext>()));
            services.RemoveAll<IContactInquiryWriter>();
            services.AddSingleton<IContactInquiryWriter>(Writer);
            services.RemoveAll<IEmailSender<DigiSayUser>>();
            services.AddSingleton<IEmailSender<DigiSayUser>>(EmailSender);
            services.RemoveAll<IPrivateObjectStorage>();
            services.AddSingleton<IPrivateObjectStorage>(Storage);
            services.RemoveAll<IPublicFaqSearchTool>();
            services.AddSingleton<IPublicFaqSearchTool>(PublicFaqSearch);
            services.RemoveAll<ILanguageModelProvider>();
            services.AddSingleton<ILanguageModelProvider>(LanguageModel);
            if (RateLimitStoreUnavailable)
            {
                services.RemoveAll<IRateLimitStore>();
                services.AddSingleton<IRateLimitStore, UnavailableRateLimitStore>();
            }
        });
    }

    public async Task InitializeDatabaseAsync()
    {
        using var scope = Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<DigiSayDbContext>();
        await dbContext.Database.EnsureCreatedAsync();
    }

    public async Task<DigiSayDbContext> CreateVerifiedOrganizationDbContextAsync(Guid organizationId, Guid userId)
    {
        var organizationContext = new OrganizationContext();
        using (var verificationContext = new DigiSayDbContext(
            new DbContextOptionsBuilder<DigiSayDbContext>().UseSqlServer(TestConnectionString).Options,
            organizationContext))
        {
            var isActiveMember = await verificationContext.OrganizationMemberships
                .AsNoTracking()
                .AnyAsync(membership => membership.OrganizationId == organizationId &&
                    membership.UserId == userId && membership.Status == OrganizationMembershipStatus.Active);
            if (!isActiveMember)
            {
                throw new InvalidOperationException("Test organization context requires an active persisted membership.");
            }
        }

        organizationContext.Set(organizationId, userId, "Test");
        return new DigiSayDbContext(
            new DbContextOptionsBuilder<DigiSayDbContext>().UseSqlServer(TestConnectionString).Options,
            organizationContext);
    }

    public async Task<HttpResponseMessage> ConfirmEmailAsync(HttpClient client, string email)
    {
        var confirmationLink = EmailSender.GetConfirmationLink(email);
        var confirmationUri = new Uri(WebUtility.HtmlDecode(confirmationLink));
        return await client.GetAsync(confirmationUri.PathAndQuery);
    }

}

internal sealed class RecordingPublicFaqSearchTool : IPublicFaqSearchTool
{
    public int CallCount { get; private set; }

    public Task<IReadOnlyList<PublicFaqSource>> SearchAsync(string question, int maximumResults, CancellationToken cancellationToken)
    {
        CallCount++;
        IReadOnlyList<PublicFaqSource> result = question.Contains("service", StringComparison.OrdinalIgnoreCase)
            ? [new PublicFaqSource("services", "DigiSay services", "/services", "DigiSay offers content production and social media services.")]
            : [];
        return Task.FromResult(result);
    }
}

internal sealed class RecordingLanguageModelProvider : ILanguageModelProvider
{
    public int CallCount { get; private set; }

    public Task<string> CompleteAsync(string systemPrompt, string userPrompt, CancellationToken cancellationToken)
    {
        CallCount++;
        return Task.FromResult("DigiSay offers content production and social media services.");
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

internal sealed class UnavailableRateLimitStore : IRateLimitStore
{
    public Task<RateLimitDecision> TryAcquireAsync(string key, int permitLimit, TimeSpan window, CancellationToken cancellationToken) =>
        throw new InvalidOperationException("Test rate-limit backend unavailable.");
}

internal sealed class RecordingPrivateObjectStorage : IPrivateObjectStorage
{
    private readonly ConcurrentDictionary<(Guid OrganizationId, Guid ObjectId), (string ContentType, byte[] Content)> _objects = new();

    public IReadOnlyCollection<Guid> OrganizationIds => _objects.Keys.Select(key => key.OrganizationId).ToArray();
    public int? ProviderFailureStatusCode { get; set; }

    public Task<IReadOnlyList<StorageObject>> ListAsync(Guid organizationId, CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<StorageObject>>(_objects
            .Where(item => item.Key.OrganizationId == organizationId)
            .Select(item => new StorageObject(item.Key.ObjectId, item.Value.ContentType, item.Value.Content.Length, DateTimeOffset.UtcNow))
            .ToArray());

    public async Task UploadAsync(Guid organizationId, Guid objectId, Stream content, string verifiedContentType, CancellationToken cancellationToken)
    {
        using var buffer = new MemoryStream();
        await content.CopyToAsync(buffer, cancellationToken);
        _objects[(organizationId, objectId)] = (verifiedContentType, buffer.ToArray());
    }

    public Task<Uri> CreateSignedDownloadUrlAsync(Guid organizationId, Guid objectId, TimeSpan expiresIn, CancellationToken cancellationToken)
    {
        if (ProviderFailureStatusCode is int statusCode)
        {
            throw new StorageProviderException("The test storage provider failed.", statusCode);
        }

        if (!_objects.ContainsKey((organizationId, objectId)))
        {
            throw new StorageProviderException("Object not found.", StatusCodes.Status404NotFound);
        }

        return Task.FromResult(new Uri($"https://storage.example.test/sign/{organizationId:N}/{objectId:N}?download=true&expires={expiresIn.TotalSeconds}"));
    }

    public Task DeleteAsync(Guid organizationId, Guid objectId, CancellationToken cancellationToken)
    {
        if (ProviderFailureStatusCode is int statusCode)
        {
            throw new StorageProviderException("The test storage provider failed.", statusCode);
        }

        if (!_objects.TryRemove((organizationId, objectId), out _))
        {
            throw new StorageProviderException("Object not found.", StatusCodes.Status404NotFound);
        }

        return Task.CompletedTask;
    }
}

internal sealed class RecordingLoggerProvider(ConcurrentQueue<string> logs) : ILoggerProvider
{
    public ILogger CreateLogger(string categoryName) => new RecordingLogger(categoryName, logs);
    public void Dispose() { }

    private sealed class RecordingLogger(string categoryName, ConcurrentQueue<string> logs) : ILogger
    {
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;
        public bool IsEnabled(LogLevel logLevel) => logLevel >= LogLevel.Warning;

        public void Log<TState>(
            LogLevel logLevel,
            EventId eventId,
            TState state,
            Exception? exception,
            Func<TState, Exception?, string> formatter)
        {
            if (IsEnabled(logLevel))
            {
                logs.Enqueue($"{categoryName}: {formatter(state, exception)} {exception}");
            }
        }
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
