using DigiSay.Domain.Entities.CRM;
using DigiSay.Application.Common.Organizations;
using DigiSay.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace DigiSay.Infrastructure.Tests;

public sealed class PersistenceModelTests
{
    [Fact]
    public void Tenant_owned_crm_entities_use_organization_composite_keys_and_email_storage_conversion()
    {
        var options = new DbContextOptionsBuilder<DigiSayDbContext>()
            .UseSqlServer("Server=localhost;Database=DigiSayModelTests;User Id=sa;Password=Local-only-Not-Used!2026;TrustServerCertificate=True")
            .Options;
        using var context = new DigiSayDbContext(options, new OrganizationContext());
        var lead = context.Model.FindEntityType(typeof(Lead))!;
        var request = context.Model.FindEntityType(typeof(ServiceRequest))!;
        var note = context.Model.FindEntityType(typeof(LeadNote))!;
        var followUp = context.Model.FindEntityType(typeof(LeadFollowUp))!;
        var history = context.Model.FindEntityType(typeof(LeadStatusHistory))!;
        var outbox = context.Model.FindEntityType(typeof(OutboxMessage))!;

        Assert.Equal(["OrganizationId", "Id"], lead.FindPrimaryKey()!.Properties.Select(property => property.Name));
        Assert.Equal(["OrganizationId", "Id"], request.FindPrimaryKey()!.Properties.Select(property => property.Name));
        Assert.Equal(["OrganizationId", "Id"], note.FindPrimaryKey()!.Properties.Select(property => property.Name));
        Assert.Equal(["OrganizationId", "Id"], followUp.FindPrimaryKey()!.Properties.Select(property => property.Name));
        Assert.Equal(["OrganizationId", "Id"], history.FindPrimaryKey()!.Properties.Select(property => property.Name));
        Assert.NotNull(lead.FindProperty(nameof(Lead.Email))!.GetTypeMapping().Converter);
        Assert.Equal("crm", lead.GetSchema());
        Assert.Equal("crm", request.GetSchema());
        Assert.Equal("crm", note.GetSchema());
        Assert.Equal("crm", followUp.GetSchema());
        Assert.Equal("crm", history.GetSchema());
        Assert.NotEmpty(lead.GetDeclaredQueryFilters());
        Assert.NotEmpty(request.GetDeclaredQueryFilters());
        Assert.Contains(lead.GetIndexes(), index => index.GetDatabaseName() == "IX_Leads_OrganizationId_CreatedAtUtc_Id");
        Assert.Contains(request.GetIndexes(), index => index.GetDatabaseName() == "IX_ServiceRequests_OrganizationId_CreatedAtUtc_Id");
        Assert.Empty(outbox.GetDeclaredQueryFilters());
        Assert.Equal("integration", outbox.GetSchema());
        Assert.Contains(outbox.GetIndexes(), index => index.GetDatabaseName() == "IX_OutboxMessages_Dispatch");
    }
}
