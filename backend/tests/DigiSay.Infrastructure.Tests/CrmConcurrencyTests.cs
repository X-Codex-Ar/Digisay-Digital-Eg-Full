using DigiSay.Application.Common;
using DigiSay.Application.Common.Organizations;
using DigiSay.Domain.Entities.CRM;
using DigiSay.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Xunit;

namespace DigiSay.Infrastructure.Tests;

public sealed class CrmConcurrencyTests
{
    private const string ModelOnlyConnectionString =
        "Server=localhost;Database=DigiSayModelTests;User Id=sa;Password=Local-only-Not-Used!2026;TrustServerCertificate=True";

    [Fact]
    public void Lead_and_follow_up_use_a_database_generated_row_version_as_concurrency_token()
    {
        using var context = new DigiSayDbContext(new DbContextOptionsBuilder<DigiSayDbContext>()
            .UseSqlServer(ModelOnlyConnectionString)
            .Options, new OrganizationContext());

        foreach (var (entityType, propertyName) in new[]
                 {
                     (typeof(Lead), nameof(Lead.RowVersion)),
                     (typeof(LeadFollowUp), nameof(LeadFollowUp.RowVersion)),
                 })
        {
            var property = context.Model.FindEntityType(entityType)!.FindProperty(propertyName)!;
            Assert.True(property.IsConcurrencyToken);
            Assert.Equal(ValueGenerated.OnAddOrUpdate, property.ValueGenerated);
        }
    }

    [Fact]
    public async Task Store_reports_a_rejected_stale_save_as_a_concurrency_conflict()
    {
        // The interceptor throws before any database connection is opened.
        using var context = new DigiSayDbContext(new DbContextOptionsBuilder<DigiSayDbContext>()
            .UseSqlServer(ModelOnlyConnectionString)
            .AddInterceptors(new StaleSaveInterceptor())
            .Options, new OrganizationContext());
        var store = new CrmStore(context);

        await Assert.ThrowsAsync<ConcurrencyConflictException>(() => store.SaveChangesAsync(CancellationToken.None));
    }

    private sealed class StaleSaveInterceptor : SaveChangesInterceptor
    {
        public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default) =>
            throw new DbUpdateConcurrencyException("Simulated stale row version.");
    }
}
