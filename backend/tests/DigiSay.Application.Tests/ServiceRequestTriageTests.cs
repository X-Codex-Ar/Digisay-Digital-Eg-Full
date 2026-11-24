using DigiSay.Application.Common.Organizations;
using DigiSay.Application.Features.AI.ServiceRequestTriage;
using DigiSay.Application.Features.CRM.ServiceRequests.Abstractions;
using DigiSay.Domain.Entities.CRM;
using Xunit;

namespace DigiSay.Application.Tests;

public sealed class ServiceRequestTriageTests
{
    [Fact]
    public async Task Suggestion_loads_only_the_verified_organization_record_and_requires_human_review()
    {
        var organizationId = Guid.NewGuid();
        var actorId = Guid.NewGuid();
        var request = ServiceRequest.Create(organizationId, "Campaign launch", "Plan launch assets", "Marketing", actorId);
        var store = new RecordingServiceRequestStore(request);
        var minimizer = new RecordingDataMinimizer();
        var provider = new RecordingTriageProvider(new ServiceRequestTriageSuggestion(
            "Campaign planning", TriageUrgency.Normal, "The request asks for launch campaign planning."));

        var result = await new SuggestServiceRequestTriageHandler(store, minimizer, provider).HandleAsync(
            request.Id,
            CreateOrganizationContext(organizationId, actorId),
            CancellationToken.None);

        Assert.True(result.Found);
        Assert.True(result.RequiresHumanReview);
        Assert.Equal(organizationId, store.RequestedOrganizationId);
        Assert.Equal(request.Id, store.RequestedRequestId);
        Assert.Equal(new ServiceRequestTriageInput("Marketing", "Campaign launch", "[redacted]"), provider.Input);
        Assert.Equal(new ServiceRequestTriageInput("Marketing", "Campaign launch", "Plan launch assets"), minimizer.Input);
        Assert.Equal("Campaign planning", result.Suggestion!.Category);
    }

    [Fact]
    public async Task Suggestion_does_not_call_provider_when_request_is_outside_the_verified_organization()
    {
        var organizationId = Guid.NewGuid();
        var actorId = Guid.NewGuid();
        var store = new RecordingServiceRequestStore(null);
        var minimizer = new RecordingDataMinimizer();
        var provider = new RecordingTriageProvider(new ServiceRequestTriageSuggestion("Other", TriageUrgency.Low, "No details."));

        var result = await new SuggestServiceRequestTriageHandler(store, minimizer, provider).HandleAsync(
            Guid.NewGuid(),
            CreateOrganizationContext(organizationId, actorId),
            CancellationToken.None);

        Assert.False(result.Found);
        Assert.Null(result.Suggestion);
        Assert.Null(provider.Input);
        Assert.Null(minimizer.Input);
        Assert.Equal(organizationId, store.RequestedOrganizationId);
    }

    [Fact]
    public void Output_validator_rejects_unsupported_or_unbounded_model_output()
    {
        Assert.Throws<ServiceRequestTriageOutputException>(() =>
            ServiceRequestTriageOutputValidator.Validate(null));
        Assert.Throws<ServiceRequestTriageOutputException>(() =>
            ServiceRequestTriageOutputValidator.Validate(new(" ", TriageUrgency.Low, "Reason")));
        Assert.Throws<ServiceRequestTriageOutputException>(() =>
            ServiceRequestTriageOutputValidator.Validate(new("Category", (TriageUrgency)999, "Reason")));
        Assert.Throws<ServiceRequestTriageOutputException>(() =>
            ServiceRequestTriageOutputValidator.Validate(new("Category", TriageUrgency.High, new string('x', 501))));
    }

    private sealed class RecordingServiceRequestStore(ServiceRequest? request) : IServiceRequestStore
    {
        public Guid? RequestedOrganizationId { get; private set; }
        public Guid? RequestedRequestId { get; private set; }

        public Task<ServiceRequest?> FindServiceRequestAsync(Guid organizationId, Guid id, CancellationToken cancellationToken)
        {
            RequestedOrganizationId = organizationId;
            RequestedRequestId = id;
            return Task.FromResult(request?.OrganizationId == organizationId && request.Id == id ? request : null);
        }

        public Task AddAsync(ServiceRequest serviceRequest, CancellationToken cancellationToken) => throw new NotSupportedException();
        public Task<DigiSay.Application.Common.Pagination.PageSlice<ServiceRequest>> ListServiceRequestsAsync(Guid organizationId, int skip, int take, CancellationToken cancellationToken) => throw new NotSupportedException();
        public Task SaveChangesAsync(CancellationToken cancellationToken) => throw new NotSupportedException();
    }

    private static OrganizationContext CreateOrganizationContext(Guid organizationId, Guid actorId)
    {
        var context = new OrganizationContext();
        context.Set(organizationId, actorId, "Owner");
        return context;
    }

    private sealed class RecordingTriageProvider(ServiceRequestTriageSuggestion suggestion) : IServiceRequestTriageProvider
    {
        public ServiceRequestTriageInput? Input { get; private set; }

        public Task<ServiceRequestTriageSuggestion> SuggestAsync(ServiceRequestTriageInput input, CancellationToken cancellationToken)
        {
            Input = input;
            return Task.FromResult(suggestion);
        }
    }

    private sealed class RecordingDataMinimizer : IServiceRequestTriageDataMinimizer
    {
        public ServiceRequestTriageInput? Input { get; private set; }

        public ServiceRequestTriageInput Minimize(ServiceRequestTriageInput input)
        {
            Input = input;
            return input with { Description = "[redacted]" };
        }
    }
}
