using DigiSay.Application.Common.Organizations;
using DigiSay.Application.Common.Pagination;
using DigiSay.Application.Features.CRM.Leads.Abstractions;
using DigiSay.Application.Features.CRM.Leads.Commands.CreateLead;
using DigiSay.Application.Features.CRM.Leads.Commands.TransitionLead;
using DigiSay.Domain.Entities.CRM;
using DigiSay.Domain.Enums;
using Xunit;

namespace DigiSay.Application.Tests;

public sealed class LeadUseCaseTests
{
    [Fact]
    public async Task Create_lead_uses_the_verified_organization_and_actor_scope()
    {
        var organizationId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var store = new FakeLeadStore();
        var handler = new CreateLeadHandler(store);

        var lead = await handler.HandleAsync(
            new CreateLeadCommand("Ada Lovelace", "ADA@example.com", null, "Website"),
            new TestOrganizationContext(organizationId, userId),
            CancellationToken.None);

        Assert.Equal(organizationId, lead.OrganizationId);
        Assert.Equal(userId, lead.CreatedByUserId);
        Assert.Same(lead, store.AddedLead);
    }

    [Fact]
    public async Task Transition_persists_only_a_valid_lifecycle_change()
    {
        var organizationId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var lead = Lead.Create(organizationId, "Ada Lovelace", "ada@example.com", null, null, userId);
        var store = new FakeLeadStore(lead);
        var handler = new TransitionLeadHandler(store);
        var scope = new TestOrganizationContext(organizationId, userId);

        var invalid = await handler.HandleAsync(lead.Id, new TransitionLeadCommand(LeadStatus.Converted), scope, CancellationToken.None);
        Assert.True(invalid.Found);
        Assert.False(invalid.Transitioned);
        Assert.Equal(0, store.SaveCount);

        var valid = await handler.HandleAsync(lead.Id, new TransitionLeadCommand(LeadStatus.Contacted), scope, CancellationToken.None);
        Assert.True(valid.Transitioned);
        Assert.Equal(1, store.SaveCount);
    }

    private sealed class TestOrganizationContext(Guid organizationId, Guid userId) : IOrganizationContext
    {
        public Guid OrganizationId { get; } = organizationId;
        public Guid UserId { get; } = userId;
        public string MembershipRole => "Owner";
    }

    private sealed class FakeLeadStore(Lead? lead = null) : ILeadStore
    {
        public Lead? AddedLead { get; private set; }
        public int SaveCount { get; private set; }
        public Task AddAsync(Lead value, CancellationToken cancellationToken) { AddedLead = value; return Task.CompletedTask; }
        public Task<Lead?> FindLeadAsync(Guid organizationId, Guid id, CancellationToken cancellationToken) =>
            Task.FromResult(lead is { } item && item.OrganizationId == organizationId && item.Id == id ? item : null);
        public Task<PageSlice<Lead>> ListLeadsAsync(Guid organizationId, int skip, int take, CancellationToken cancellationToken) =>
            Task.FromResult(new PageSlice<Lead>([], 0));
        public Task SaveChangesAsync(CancellationToken cancellationToken) { SaveCount++; return Task.CompletedTask; }
    }
}
