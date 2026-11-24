using DigiSay.Domain.Entities.CRM;
using DigiSay.Domain.Enums;
using Xunit;

namespace DigiSay.Domain.Tests;

public sealed class CrmLifecycleTests
{
    [Fact]
    public void Lead_follows_the_sales_pipeline_and_keeps_lost_and_converted_terminal()
    {
        var organizationId = Guid.NewGuid();
        var actorId = Guid.NewGuid();
        var lead = Lead.Create(organizationId, "  Ada Lovelace ", " ADA@EXAMPLE.COM ", null, "Website", actorId);

        Assert.Equal("Ada Lovelace", lead.Name);
        Assert.Equal("ada@example.com", lead.Email.Value);
        Assert.Equal(LeadStatus.New, lead.Status);
        Assert.True(lead.TryTransitionTo(LeadStatus.Contacted, actorId));
        Assert.True(lead.TryTransitionTo(LeadStatus.Qualified, actorId));
        Assert.True(lead.TryTransitionTo(LeadStatus.Proposal, actorId));
        Assert.True(lead.TryTransitionTo(LeadStatus.Negotiation, actorId));
        Assert.True(lead.TryTransitionTo(LeadStatus.Converted, actorId));
        Assert.False(lead.TryTransitionTo(LeadStatus.Lost, actorId));
    }

    [Fact]
    public void Service_request_rejects_skipped_states_and_allows_cancelled_or_completed_terminal_states()
    {
        var request = ServiceRequest.Create(
            Guid.NewGuid(), "Campaign launch", "Launch campaign for the spring product.", "Marketing", Guid.NewGuid());

        Assert.Equal(ServiceRequestStatus.Submitted, request.Status);
        Assert.False(request.TryTransitionTo(ServiceRequestStatus.Completed, Guid.NewGuid()));
        Assert.True(request.TryTransitionTo(ServiceRequestStatus.UnderReview, Guid.NewGuid()));
        Assert.True(request.TryTransitionTo(ServiceRequestStatus.Approved, Guid.NewGuid()));
        Assert.True(request.TryTransitionTo(ServiceRequestStatus.InProgress, Guid.NewGuid()));
        Assert.True(request.TryTransitionTo(ServiceRequestStatus.Completed, Guid.NewGuid()));
        Assert.False(request.TryTransitionTo(ServiceRequestStatus.Cancelled, Guid.NewGuid()));
    }

    [Fact]
    public void Updates_record_the_actor_and_utc_timestamp()
    {
        var createdBy = Guid.NewGuid();
        var updatedBy = Guid.NewGuid();
        var lead = Lead.Create(Guid.NewGuid(), "Grace Hopper", "grace@example.com", null, null, createdBy);
        var beforeUpdate = DateTimeOffset.UtcNow;

        lead.Update("Grace Hopper", "grace@example.com", "+1 555 0100", "Referral", updatedBy);

        Assert.Equal(createdBy, lead.CreatedByUserId);
        Assert.Equal(updatedBy, lead.UpdatedByUserId);
        Assert.InRange(lead.UpdatedAtUtc, beforeUpdate, DateTimeOffset.UtcNow);
        Assert.Equal("+1 555 0100", lead.Phone);
    }
}
