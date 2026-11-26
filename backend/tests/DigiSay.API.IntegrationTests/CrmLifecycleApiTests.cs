using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using DigiSay.Application.Common;
using DigiSay.Application.Common.Organizations;
using DigiSay.Application.Features.CRM.Leads.Abstractions;
using DigiSay.Application.Features.CRM.Leads.Commands.CompleteLeadFollowUp;
using DigiSay.Application.Features.CRM.Leads.Commands.TransitionLead;
using DigiSay.Domain.Enums;
using DigiSay.Domain.Entities.Organizations;
using DigiSay.Infrastructure.Identity;
using DigiSay.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace DigiSay.API.IntegrationTests;

public sealed class CrmLifecycleApiTests
{
    private const string Password = "G00d-Password!2026";

    [Fact]
    public async Task Lead_operations_enforce_lifecycle_and_record_actors()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var client = await CreateOrganizationClientAsync(factory, "sales@example.test", "Agency Alpha");

        using var invalidTransition = await client.PostAsJsonAsync(
            "/api/v1/crm/leads/00000000-0000-0000-0000-000000000001/transitions",
            new { status = "Converted" });
        Assert.Equal(HttpStatusCode.NotFound, invalidTransition.StatusCode);

        using var create = await client.PostAsJsonAsync("/api/v1/crm/leads", new
        {
            name = "  Ada Lovelace ",
            email = " ADA@EXAMPLE.TEST ",
            phone = "+1 555 0100",
            source = "Website",
        });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        using var created = await JsonDocument.ParseAsync(await create.Content.ReadAsStreamAsync());
        var id = created.RootElement.GetProperty("id").GetGuid();
        var actorId = created.RootElement.GetProperty("createdByUserId").GetGuid();
        Assert.Equal("ada@example.test", created.RootElement.GetProperty("email").GetString());
        Assert.Equal("New", created.RootElement.GetProperty("status").GetString());

        using var skippedState = await client.PostAsJsonAsync(
            $"/api/v1/crm/leads/{id}/transitions",
            new { status = "Qualified" });
        Assert.Equal(HttpStatusCode.Conflict, skippedState.StatusCode);

        foreach (var status in new[] { "Contacted", "Qualified", "Proposal", "Negotiation", "Converted" })
        {
            using var transition = await client.PostAsJsonAsync(
                $"/api/v1/crm/leads/{id}/transitions",
                new { status });
            Assert.Equal(HttpStatusCode.OK, transition.StatusCode);
        }

        using var update = await client.PutAsJsonAsync($"/api/v1/crm/leads/{id}", new
        {
            name = "Ada Byron",
            email = "ada.byron@example.test",
            phone = (string?)null,
            source = "Referral",
        });
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);
        using var updated = await JsonDocument.ParseAsync(await update.Content.ReadAsStreamAsync());
        Assert.Equal("Ada Byron", updated.RootElement.GetProperty("name").GetString());
        Assert.Equal("Converted", updated.RootElement.GetProperty("status").GetString());
        Assert.Equal(actorId, updated.RootElement.GetProperty("updatedByUserId").GetGuid());
        Assert.True(updated.RootElement.GetProperty("updatedAtUtc").GetDateTimeOffset() >=
            created.RootElement.GetProperty("createdAtUtc").GetDateTimeOffset());

        using var listResponse = await client.GetAsync("/api/v1/crm/leads?page=1&pageSize=5");
        var listBody = await listResponse.Content.ReadAsStringAsync();
        Assert.True(listResponse.StatusCode == HttpStatusCode.OK, $"{listBody}\n{string.Join(Environment.NewLine, factory.Logs)}");
        var leads = JsonSerializer.Deserialize<PagedResponse<LeadResponse>>(listBody, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        Assert.NotNull(leads);
        Assert.Equal(1, leads.TotalCount);
        Assert.Single(leads.Items);

        using var statusFilterResponse = await client.GetAsync("/api/v1/crm/leads?search=Byron&status=Converted&page=1&pageSize=5");
        Assert.Equal(HttpStatusCode.OK, statusFilterResponse.StatusCode);
        var filteredLeads = await statusFilterResponse.Content.ReadFromJsonAsync<PagedResponse<LeadResponse>>();
        Assert.NotNull(filteredLeads);
        Assert.Equal(1, filteredLeads.TotalCount);

        using var historyResponse = await client.GetAsync($"/api/v1/crm/leads/{id}/history?page=1&pageSize=20");
        Assert.Equal(HttpStatusCode.OK, historyResponse.StatusCode);
        var history = await historyResponse.Content.ReadFromJsonAsync<PagedResponse<LeadStatusHistoryResponse>>();
        Assert.NotNull(history);
        Assert.Equal(6, history.TotalCount);
        Assert.Contains(history.Items, item => item.FromStatus is null && item.ToStatus == "New");
        Assert.Contains(history.Items, item => item.FromStatus == "Negotiation" && item.ToStatus == "Converted");
    }

    [Fact]
    public async Task Lead_search_matches_partial_email_case_insensitively_and_stays_within_organization()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var owner = await CreateOrganizationClientAsync(factory, "email-search-owner@example.test", "Email Search Org");
        using var other = await CreateOrganizationClientAsync(factory, "email-search-other@example.test", "Other Email Org");

        using var createLead = await owner.PostAsJsonAsync("/api/v1/crm/leads", new
        {
            name = "Grace Hopper", email = "ada.byron@example.test", source = "Referral",
        });
        Assert.Equal(HttpStatusCode.Created, createLead.StatusCode);
        var lead = await createLead.Content.ReadFromJsonAsync<LeadResponse>();
        Assert.NotNull(lead);

        using var createWildcardTrap = await owner.PostAsJsonAsync("/api/v1/crm/leads", new
        {
            name = "Numbered contact", email = "100sample@other.test", source = "Referral",
        });
        Assert.Equal(HttpStatusCode.Created, createWildcardTrap.StatusCode);

        using var createOtherLead = await other.PostAsJsonAsync("/api/v1/crm/leads", new
        {
            name = "Other person", email = "other@other.test", source = "Referral",
        });
        Assert.Equal(HttpStatusCode.Created, createOtherLead.StatusCode);

        foreach (var term in new[] { "ada", "@example.test", "ada.byr", "ADA.BYRON@EXAMPLE.TEST" })
        {
            using var response = await owner.GetAsync($"/api/v1/crm/leads?search={Uri.EscapeDataString(term)}&page=1&pageSize=10");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var page = await response.Content.ReadFromJsonAsync<PagedResponse<LeadResponse>>();
            Assert.NotNull(page);
            Assert.Equal(1, page.TotalCount);
            Assert.Equal(lead.Id, Assert.Single(page.Items).Id);
        }

        using var escapedWildcard = await owner.GetAsync($"/api/v1/crm/leads?search={Uri.EscapeDataString("100%_")}&page=1&pageSize=10");
        Assert.Equal(HttpStatusCode.OK, escapedWildcard.StatusCode);
        var escapedWildcardPage = await escapedWildcard.Content.ReadFromJsonAsync<PagedResponse<LeadResponse>>();
        Assert.NotNull(escapedWildcardPage);
        Assert.Equal(0, escapedWildcardPage.TotalCount);
        Assert.Empty(escapedWildcardPage.Items);

        using var escapedBracket = await owner.GetAsync($"/api/v1/crm/leads?search={Uri.EscapeDataString("[a]")}&page=1&pageSize=10");
        Assert.Equal(HttpStatusCode.OK, escapedBracket.StatusCode);
        var escapedBracketPage = await escapedBracket.Content.ReadFromJsonAsync<PagedResponse<LeadResponse>>();
        Assert.NotNull(escapedBracketPage);
        Assert.Empty(escapedBracketPage.Items);

        using var crossOrganizationSearch = await other.GetAsync("/api/v1/crm/leads?search=ada&page=1&pageSize=10");
        Assert.Equal(HttpStatusCode.OK, crossOrganizationSearch.StatusCode);
        var otherPage = await crossOrganizationSearch.Content.ReadFromJsonAsync<PagedResponse<LeadResponse>>();
        Assert.NotNull(otherPage);
        Assert.DoesNotContain(otherPage.Items, item => item.Id == lead.Id);
    }

    [Fact]
    public async Task Lead_notes_and_followups_are_tenant_scoped_and_followups_complete_once()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var owner = await CreateOrganizationClientAsync(factory, "lead-owner@example.test", "Owner Org");
        using var other = await CreateOrganizationClientAsync(factory, "lead-other@example.test", "Other Org");

        using var createLead = await owner.PostAsJsonAsync("/api/v1/crm/leads", new
        {
            name = "Grace Hopper", email = "grace@example.test", source = "Referral",
        });
        Assert.Equal(HttpStatusCode.Created, createLead.StatusCode);
        var createdLead = await createLead.Content.ReadFromJsonAsync<LeadResponse>();
        Assert.NotNull(createdLead);

        using var addNote = await owner.PostAsJsonAsync($"/api/v1/crm/leads/{createdLead.Id}/notes", new { content = "Discussed Q3 launch requirements." });
        Assert.Equal(HttpStatusCode.Created, addNote.StatusCode);

        using var addFollowUp = await owner.PostAsJsonAsync($"/api/v1/crm/leads/{createdLead.Id}/follow-ups", new
        {
            title = "Send proposal", details = "Include the digital strategy scope.", dueAtUtc = DateTimeOffset.UtcNow.AddDays(2),
        });
        Assert.Equal(HttpStatusCode.Created, addFollowUp.StatusCode);
        var followUp = await addFollowUp.Content.ReadFromJsonAsync<LeadFollowUpResponse>();
        Assert.NotNull(followUp);

        using var addOpenFollowUp = await owner.PostAsJsonAsync($"/api/v1/crm/leads/{createdLead.Id}/follow-ups", new
        {
            title = "Confirm assets", details = "Check the source files.", dueAtUtc = DateTimeOffset.UtcNow.AddDays(1),
        });
        Assert.Equal(HttpStatusCode.Created, addOpenFollowUp.StatusCode);
        var openFollowUp = await addOpenFollowUp.Content.ReadFromJsonAsync<LeadFollowUpResponse>();
        Assert.NotNull(openFollowUp);

        using var complete = await owner.PostAsync($"/api/v1/crm/leads/{createdLead.Id}/follow-ups/{followUp.Id}/complete", null);
        Assert.Equal(HttpStatusCode.OK, complete.StatusCode);
        using var completeAgain = await owner.PostAsync($"/api/v1/crm/leads/{createdLead.Id}/follow-ups/{followUp.Id}/complete", null);
        Assert.Equal(HttpStatusCode.Conflict, completeAgain.StatusCode);

        using var ownNotes = await owner.GetAsync($"/api/v1/crm/leads/{createdLead.Id}/notes");
        using var foreignNotes = await other.GetAsync($"/api/v1/crm/leads/{createdLead.Id}/notes");
        using var foreignComplete = await other.PostAsync($"/api/v1/crm/leads/{createdLead.Id}/follow-ups/{followUp.Id}/complete", null);
        Assert.Equal(HttpStatusCode.OK, ownNotes.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, foreignNotes.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, foreignComplete.StatusCode);

        using var firstFollowUpPageResponse = await owner.GetAsync($"/api/v1/crm/leads/{createdLead.Id}/follow-ups?page=1&pageSize=1");
        Assert.Equal(HttpStatusCode.OK, firstFollowUpPageResponse.StatusCode);
        var firstFollowUpPage = await firstFollowUpPageResponse.Content.ReadFromJsonAsync<PagedResponse<LeadFollowUpResponse>>();
        Assert.NotNull(firstFollowUpPage);
        Assert.Equal(2, firstFollowUpPage.TotalCount);
        Assert.Single(firstFollowUpPage.Items);
        Assert.Equal(openFollowUp.Id, firstFollowUpPage.Items[0].Id);

        using var secondFollowUpPageResponse = await owner.GetAsync($"/api/v1/crm/leads/{createdLead.Id}/follow-ups?page=2&pageSize=1");
        Assert.Equal(HttpStatusCode.OK, secondFollowUpPageResponse.StatusCode);
        var secondFollowUpPage = await secondFollowUpPageResponse.Content.ReadFromJsonAsync<PagedResponse<LeadFollowUpResponse>>();
        Assert.NotNull(secondFollowUpPage);
        Assert.Equal(2, secondFollowUpPage.TotalCount);
        var completedFollowUp = Assert.Single(secondFollowUpPage.Items);
        Assert.Equal(followUp.Id, completedFollowUp.Id);
        Assert.NotNull(completedFollowUp.CompletedAtUtc);
        Assert.Equal(createdLead.CreatedByUserId, completedFollowUp.CompletedByUserId);

        using var unknownLeadFollowUps = await owner.GetAsync($"/api/v1/crm/leads/{Guid.NewGuid()}/follow-ups?page=1&pageSize=1");
        Assert.Equal(HttpStatusCode.NotFound, unknownLeadFollowUps.StatusCode);

        using var createForeignLead = await other.PostAsJsonAsync("/api/v1/crm/leads", new
        {
            name = "Foreign lead", email = "foreign-lead@example.test", source = "Referral",
        });
        Assert.Equal(HttpStatusCode.Created, createForeignLead.StatusCode);
        var foreignLead = await createForeignLead.Content.ReadFromJsonAsync<LeadResponse>();
        Assert.NotNull(foreignLead);
        using var foreignLeadFollowUps = await owner.GetAsync($"/api/v1/crm/leads/{foreignLead.Id}/follow-ups?page=1&pageSize=1");
        Assert.Equal(HttpStatusCode.NotFound, foreignLeadFollowUps.StatusCode);

        var notes = await ownNotes.Content.ReadFromJsonAsync<PagedResponse<LeadNoteResponse>>();
        Assert.NotNull(notes);
        Assert.Equal(1, notes.TotalCount);
    }

    [Fact]
    public async Task SqlServer_concurrent_follow_up_completion_rejects_stale_writer_and_keeps_first_values()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var owner = await CreateOrganizationClientAsync(factory, "follow-up-race-owner@example.test", "Follow-up Race Org");
        using var other = await CreateOrganizationClientAsync(factory, "follow-up-race-other@example.test", "Other Race Org");
        var organizationId = Guid.Parse(owner.DefaultRequestHeaders.GetValues("X-Organization-Id").Single());

        using var createLead = await owner.PostAsJsonAsync("/api/v1/crm/leads", new
        {
            name = "Follow-up race", email = "follow-up-race@example.test",
        });
        Assert.Equal(HttpStatusCode.Created, createLead.StatusCode);
        var lead = await createLead.Content.ReadFromJsonAsync<LeadResponse>();
        Assert.NotNull(lead);

        using var createFollowUp = await owner.PostAsJsonAsync($"/api/v1/crm/leads/{lead.Id}/follow-ups", new
        {
            title = "Complete exactly once", dueAtUtc = DateTimeOffset.UtcNow.AddDays(1),
        });
        Assert.Equal(HttpStatusCode.Created, createFollowUp.StatusCode);
        var followUp = await createFollowUp.Content.ReadFromJsonAsync<LeadFollowUpResponse>();
        Assert.NotNull(followUp);
        var otherActorId = await GetUserIdAsync(factory, "follow-up-race-other@example.test");

        using var firstScope = factory.Services.CreateScope();
        using var secondScope = factory.Services.CreateScope();
        var firstDb = firstScope.ServiceProvider.GetRequiredService<DigiSayDbContext>();
        var secondDb = secondScope.ServiceProvider.GetRequiredService<DigiSayDbContext>();
        var firstLoaded = await firstDb.LeadFollowUps.SingleAsync(item => item.OrganizationId == organizationId && item.Id == followUp.Id);
        var secondLoaded = await secondDb.LeadFollowUps.SingleAsync(item => item.OrganizationId == organizationId && item.Id == followUp.Id);
        var firstScopeContext = CreateOrganizationContext(organizationId, lead.CreatedByUserId);
        var secondScopeContext = CreateOrganizationContext(organizationId, otherActorId);
        var firstHandler = new CompleteLeadFollowUpHandler(firstScope.ServiceProvider.GetRequiredService<ILeadStore>());
        var secondHandler = new CompleteLeadFollowUpHandler(secondScope.ServiceProvider.GetRequiredService<ILeadStore>());

        var firstResult = await firstHandler.HandleAsync(lead.Id, followUp.Id, firstScopeContext, CancellationToken.None);
        Assert.True(firstResult.Found);
        Assert.True(firstResult.Completed);

        using var repeatedHttpCompletion = await owner.PostAsync($"/api/v1/crm/leads/{lead.Id}/follow-ups/{followUp.Id}/complete", null);
        Assert.Equal(HttpStatusCode.Conflict, repeatedHttpCompletion.StatusCode);

        using var savedWinnerScope = factory.Services.CreateScope();
        var savedWinner = await savedWinnerScope.ServiceProvider.GetRequiredService<DigiSayDbContext>()
            .LeadFollowUps.AsNoTracking().SingleAsync(item => item.OrganizationId == organizationId && item.Id == followUp.Id);
        Assert.Equal(lead.CreatedByUserId, savedWinner.CompletedByUserId);
        Assert.NotNull(savedWinner.CompletedAtUtc);

        await Assert.ThrowsAsync<ConcurrencyConflictException>(async () =>
            await secondHandler.HandleAsync(lead.Id, followUp.Id, secondScopeContext, CancellationToken.None));
        Assert.Equal(otherActorId, secondLoaded.CompletedByUserId);

        using var finalScope = factory.Services.CreateScope();
        var finalFollowUp = await finalScope.ServiceProvider.GetRequiredService<DigiSayDbContext>()
            .LeadFollowUps.AsNoTracking().SingleAsync(item => item.OrganizationId == organizationId && item.Id == followUp.Id);
        Assert.Equal(savedWinner.CompletedByUserId, finalFollowUp.CompletedByUserId);
        Assert.Equal(savedWinner.CompletedAtUtc, finalFollowUp.CompletedAtUtc);
    }

    [Fact]
    public async Task SqlServer_concurrent_lead_transitions_roll_back_losing_history()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var owner = await CreateOrganizationClientAsync(factory, "lead-race-owner@example.test", "Lead Race Org");
        using var other = await CreateOrganizationClientAsync(factory, "lead-race-other@example.test", "Other Lead Race Org");
        var organizationId = Guid.Parse(owner.DefaultRequestHeaders.GetValues("X-Organization-Id").Single());

        using var createLead = await owner.PostAsJsonAsync("/api/v1/crm/leads", new
        {
            name = "Transition race", email = "transition-race@example.test",
        });
        Assert.Equal(HttpStatusCode.Created, createLead.StatusCode);
        var lead = await createLead.Content.ReadFromJsonAsync<LeadResponse>();
        Assert.NotNull(lead);
        var otherActorId = await GetUserIdAsync(factory, "lead-race-other@example.test");

        using var firstScope = factory.Services.CreateScope();
        using var secondScope = factory.Services.CreateScope();
        firstScope.ServiceProvider.GetRequiredService<OrganizationContext>().Set(organizationId, lead.CreatedByUserId, DigiSayRoles.Admin);
        secondScope.ServiceProvider.GetRequiredService<OrganizationContext>().Set(organizationId, otherActorId, DigiSayRoles.Admin);
        var firstDb = firstScope.ServiceProvider.GetRequiredService<DigiSayDbContext>();
        var secondDb = secondScope.ServiceProvider.GetRequiredService<DigiSayDbContext>();
        var firstLoaded = await firstDb.Leads.SingleAsync(item => item.OrganizationId == organizationId && item.Id == lead.Id);
        var secondLoaded = await secondDb.Leads.SingleAsync(item => item.OrganizationId == organizationId && item.Id == lead.Id);
        Assert.Equal(LeadStatus.New, firstLoaded.Status);
        Assert.Equal(LeadStatus.New, secondLoaded.Status);

        var firstHandler = new TransitionLeadHandler(firstScope.ServiceProvider.GetRequiredService<ILeadStore>());
        var secondHandler = new TransitionLeadHandler(secondScope.ServiceProvider.GetRequiredService<ILeadStore>());
        var firstResult = await firstHandler.HandleAsync(
            lead.Id,
            new TransitionLeadCommand(LeadStatus.Contacted),
            CreateOrganizationContext(organizationId, lead.CreatedByUserId),
            CancellationToken.None);
        Assert.True(firstResult.Transitioned);

        // New -> Qualified is not a legal lifecycle transition; Lost is the competing valid target from New.
        await Assert.ThrowsAsync<ConcurrencyConflictException>(async () =>
            await secondHandler.HandleAsync(
                lead.Id,
                new TransitionLeadCommand(LeadStatus.Lost),
                CreateOrganizationContext(organizationId, otherActorId),
                CancellationToken.None));
        Assert.Equal(LeadStatus.Lost, secondLoaded.Status);

        using var verifyScope = factory.Services.CreateScope();
        verifyScope.ServiceProvider.GetRequiredService<OrganizationContext>().Set(organizationId, lead.CreatedByUserId, DigiSayRoles.Admin);
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<DigiSayDbContext>();
        var persistedLead = await verifyDb.Leads.AsNoTracking().SingleAsync(item => item.OrganizationId == organizationId && item.Id == lead.Id);
        var history = await verifyDb.LeadStatusHistory.AsNoTracking()
            .Where(item => item.OrganizationId == organizationId && item.LeadId == lead.Id)
            .ToListAsync();

        Assert.Equal(LeadStatus.Contacted, persistedLead.Status);
        Assert.Equal(2, history.Count);
        Assert.Contains(history, item => item.FromStatus is null && item.ToStatus == LeadStatus.New);
        var transitionsFromNew = history.Where(item => item.FromStatus == LeadStatus.New).ToArray();
        var winningTransition = Assert.Single(transitionsFromNew);
        Assert.Equal(LeadStatus.Contacted, winningTransition.ToStatus);
        Assert.DoesNotContain(history, item => item.FromStatus == LeadStatus.New && item.ToStatus == LeadStatus.Lost);
    }

    [Fact]
    public async Task Service_requests_are_validated_and_follow_explicit_states()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var client = await CreateOrganizationClientAsync(factory, "client@example.test", "Northwind");

        using var invalid = await client.PostAsJsonAsync("/api/v1/crm/service-requests", new
        {
            title = "x",
            description = "",
            service = "",
        });
        Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);

        using var create = await client.PostAsJsonAsync("/api/v1/crm/service-requests", new
        {
            title = "Launch campaign",
            description = "Plan and deliver a product launch campaign.",
            service = "Marketing",
        });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        using var created = await JsonDocument.ParseAsync(await create.Content.ReadAsStreamAsync());
        var id = created.RootElement.GetProperty("id").GetGuid();

        using var skippedState = await client.PostAsJsonAsync(
            $"/api/v1/crm/service-requests/{id}/transitions",
            new { status = "Completed" });
        Assert.Equal(HttpStatusCode.Conflict, skippedState.StatusCode);

        foreach (var status in new[] { "UnderReview", "Approved", "InProgress", "Completed" })
        {
            using var transition = await client.PostAsJsonAsync(
                $"/api/v1/crm/service-requests/{id}/transitions",
                new { status });
            Assert.Equal(HttpStatusCode.OK, transition.StatusCode);
        }

        using var requestListResponse = await client.GetAsync("/api/v1/crm/service-requests?page=1&pageSize=20");
        var requestListBody = await requestListResponse.Content.ReadAsStringAsync();
        Assert.True(requestListResponse.StatusCode == HttpStatusCode.OK, requestListBody);
        var requests = JsonSerializer.Deserialize<PagedResponse<ServiceRequestResponse>>(requestListBody, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        Assert.NotNull(requests);
        Assert.Single(requests.Items);
        Assert.Equal("Completed", requests.Items[0].Status);
    }

    [Fact]
    public async Task Domain_validation_failures_are_returned_as_client_errors()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var client = await CreateOrganizationClientAsync(factory, "validation@example.test", "Validation Org");

        using var invalidLead = await client.PostAsJsonAsync("/api/v1/crm/leads", new
        {
            name = " A ",
            email = "valid@example.test",
        });
        using var invalidEmailLead = await client.PostAsJsonAsync("/api/v1/crm/leads", new
        {
            name = "Valid Name",
            email = "user@localhost",
        });
        using var invalidServiceRequest = await client.PostAsJsonAsync("/api/v1/crm/service-requests", new
        {
            title = " a ",
            description = "A valid service request description.",
            service = "Marketing",
        });

        Assert.Equal(HttpStatusCode.BadRequest, invalidLead.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, invalidEmailLead.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, invalidServiceRequest.StatusCode);
    }

    [Fact]
    public async Task CRM_reads_and_writes_are_isolated_between_organizations()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var firstClient = await CreateOrganizationClientAsync(factory, "first@example.test", "First Org");
        using var secondClient = await CreateOrganizationClientAsync(factory, "second@example.test", "Second Org");

        var firstOrganizationId = firstClient.DefaultRequestHeaders.GetValues("X-Organization-Id").Single();
        using var create = await firstClient.PostAsJsonAsync("/api/v1/crm/leads", new
        {
            name = "Grace Hopper",
            email = "grace@example.test",
            source = "Referral",
        });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        using var created = await JsonDocument.ParseAsync(await create.Content.ReadAsStreamAsync());
        var leadId = created.RootElement.GetProperty("id").GetGuid();
        using var createRequest = await firstClient.PostAsJsonAsync("/api/v1/crm/service-requests", new
        {
            title = "First organization request",
            description = "A request scoped to the first organization.",
            service = "Production",
        });
        Assert.Equal(HttpStatusCode.Created, createRequest.StatusCode);
        using var createdRequest = await JsonDocument.ParseAsync(await createRequest.Content.ReadAsStreamAsync());
        var serviceRequestId = createdRequest.RootElement.GetProperty("id").GetGuid();
        using (var eventScope = factory.Services.CreateScope())
        {
            var dbContext = eventScope.ServiceProvider.GetRequiredService<DigiSayDbContext>();
            var leadEvent = Assert.Single(
                await dbContext.OutboxMessages.AsNoTracking()
                    .Where(message => message.EventType == "crm.lead.created.v1")
                    .ToListAsync(),
                message => message.Payload.Contains(leadId.ToString(), StringComparison.OrdinalIgnoreCase));
            var requestEvent = Assert.Single(
                await dbContext.OutboxMessages.AsNoTracking()
                    .Where(message => message.EventType == "crm.service-request.created.v1")
                    .ToListAsync(),
                message => message.Payload.Contains(serviceRequestId.ToString(), StringComparison.OrdinalIgnoreCase));
            Assert.DoesNotContain("grace@example.test", leadEvent.Payload, StringComparison.OrdinalIgnoreCase);
            Assert.Null(leadEvent.LastError);
            Assert.Null(requestEvent.LastError);
        }

        Guid firstUserId;
        using (var membershipScope = factory.Services.CreateScope())
        {
            var dbContext = membershipScope.ServiceProvider.GetRequiredService<DigiSayDbContext>();
            var firstOrganization = Guid.Parse(firstOrganizationId);
            firstUserId = await dbContext.OrganizationMemberships.AsNoTracking()
                .Where(membership => membership.OrganizationId == firstOrganization)
                .Select(membership => membership.UserId)
                .SingleAsync();
        }

        secondClient.DefaultRequestHeaders.Remove("X-Organization-Id");
        var secondOrganizationId = await GetOrganizationIdAsync(secondClient);
        secondClient.DefaultRequestHeaders.Add("X-Organization-Id", secondOrganizationId.ToString());
        var crossOrganizationRead = await secondClient.GetAsync($"/api/v1/crm/leads/{leadId}");
        using var otherListResponse = await secondClient.GetAsync("/api/v1/crm/leads");
        var otherListBody = await otherListResponse.Content.ReadAsStringAsync();
        Assert.True(otherListResponse.StatusCode == HttpStatusCode.OK, otherListBody);
        var otherOrganizationLeads = JsonSerializer.Deserialize<PagedResponse<LeadResponse>>(otherListBody, new JsonSerializerOptions(JsonSerializerDefaults.Web));

        Assert.Equal(HttpStatusCode.NotFound, crossOrganizationRead.StatusCode);
        Assert.NotNull(otherOrganizationLeads);
        Assert.Empty(otherOrganizationLeads.Items);

        var firstOrganizationContext = await factory.CreateVerifiedOrganizationDbContextAsync(
            Guid.Parse(firstOrganizationId), firstUserId);
        await using (firstOrganizationContext)
        {
            Assert.Equal(1, await firstOrganizationContext.Leads.CountAsync());
            Assert.Equal(1, await firstOrganizationContext.ServiceRequests.CountAsync());
        }

        Guid secondUserId;
        using (var membershipScope = factory.Services.CreateScope())
        {
            var dbContext = membershipScope.ServiceProvider.GetRequiredService<DigiSayDbContext>();
            var secondOrganization = secondOrganizationId;
            secondUserId = await dbContext.OrganizationMemberships.AsNoTracking()
                .Where(membership => membership.OrganizationId == secondOrganization)
                .Select(membership => membership.UserId)
                .SingleAsync();
        }

        var secondOrganizationContext = await factory.CreateVerifiedOrganizationDbContextAsync(
            secondOrganizationId, secondUserId);
        await using (secondOrganizationContext)
        {
            Assert.Empty(await secondOrganizationContext.Leads.ToListAsync());
            Assert.Null(await secondOrganizationContext.Leads.SingleOrDefaultAsync(lead => lead.Id == leadId));
            Assert.Empty(await secondOrganizationContext.ServiceRequests.ToListAsync());
            Assert.Null(await secondOrganizationContext.ServiceRequests
                .SingleOrDefaultAsync(request => request.Id == serviceRequestId));
        }

        using var attemptRequest = new HttpRequestMessage(HttpMethod.Get, "/api/v1/organizations/current");
        attemptRequest.Headers.Add("X-Organization-Id", firstOrganizationId);
        using var attemptToSelectOtherOrganization = await secondClient.SendAsync(attemptRequest);
        Assert.Equal(HttpStatusCode.NotFound, attemptToSelectOtherOrganization.StatusCode);
    }

    [Fact]
    public async Task CRM_routes_reject_anonymous_requests_and_invalid_pagination()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var anonymous = factory.CreateClient();
        anonymous.DefaultRequestHeaders.Add("X-Organization-Id", Guid.NewGuid().ToString());
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync("/api/v1/crm/leads")).StatusCode);

        using var client = await CreateOrganizationClientAsync(factory, "pagination@example.test", "Pagination Org");
        var invalidPage = await client.GetAsync("/api/v1/crm/leads?page=0&pageSize=101");
        Assert.Equal(HttpStatusCode.BadRequest, invalidPage.StatusCode);
    }

    [Fact]
    public async Task Clients_can_submit_and_track_only_requests_in_their_organization()
    {
        using var factory = new DigiSayApiFactory();
        await factory.InitializeDatabaseAsync();
        using var client = await CreateOrganizationClientAsync(factory, "portal@example.test", "Portal Org", DigiSayRoles.Client);
        using var otherClient = await CreateOrganizationClientAsync(factory, "other-portal@example.test", "Other Portal Org", DigiSayRoles.Client);

        using var submit = await client.PostAsJsonAsync("/api/v1/crm/service-requests", new
        {
            title = "Campaign planning",
            description = "Please help plan our next campaign.",
            service = "Marketing",
        });
        Assert.Equal(HttpStatusCode.Created, submit.StatusCode);

        using var created = await JsonDocument.ParseAsync(await submit.Content.ReadAsStreamAsync());
        var requestId = created.RootElement.GetProperty("id").GetGuid();

        using var ownHistory = await client.GetAsync("/api/v1/crm/service-requests");
        Assert.Equal(HttpStatusCode.OK, ownHistory.StatusCode);
        var ownPage = await ownHistory.Content.ReadFromJsonAsync<PagedResponse<ServiceRequestResponse>>();
        Assert.NotNull(ownPage);
        Assert.Single(ownPage.Items);

        using var ownDetails = await client.GetAsync($"/api/v1/crm/service-requests/{requestId}");
        Assert.Equal(HttpStatusCode.OK, ownDetails.StatusCode);

        using var otherHistory = await otherClient.GetAsync("/api/v1/crm/service-requests");
        Assert.Equal(HttpStatusCode.OK, otherHistory.StatusCode);
        var otherPage = await otherHistory.Content.ReadFromJsonAsync<PagedResponse<ServiceRequestResponse>>();
        Assert.NotNull(otherPage);
        Assert.Empty(otherPage.Items);

        using var crossOrganizationDetails = await otherClient.GetAsync($"/api/v1/crm/service-requests/{requestId}");
        Assert.Equal(HttpStatusCode.NotFound, crossOrganizationDetails.StatusCode);

        using var filteredRequests = await client.GetAsync("/api/v1/crm/service-requests?search=Campaign%20planning&status=Submitted&page=1&pageSize=10");
        Assert.Equal(HttpStatusCode.OK, filteredRequests.StatusCode);
        var filteredRequestPage = await filteredRequests.Content.ReadFromJsonAsync<PagedResponse<ServiceRequestResponse>>();
        Assert.NotNull(filteredRequestPage);
        Assert.Equal(1, filteredRequestPage.TotalCount);

        using var transition = await client.PostAsJsonAsync($"/api/v1/crm/service-requests/{requestId}/transitions", new { status = "UnderReview" });
        Assert.Equal(HttpStatusCode.Forbidden, transition.StatusCode);

        using var leadAccess = await client.GetAsync("/api/v1/crm/leads");
        Assert.Equal(HttpStatusCode.Forbidden, leadAccess.StatusCode);
    }

    private static async Task<HttpClient> CreateOrganizationClientAsync(
        DigiSayApiFactory factory,
        string email,
        string organizationName,
        string role = DigiSayRoles.Admin)
    {
        var client = factory.CreateClient();
        var token = await RegisterAndSignInAsync(factory, client, email, role);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        using var response = await client.PostAsJsonAsync("/api/v1/organizations", new { name = organizationName });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        using var document = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
        client.DefaultRequestHeaders.Add("X-Organization-Id", document.RootElement.GetProperty("id").GetGuid().ToString());
        return client;
    }

    private static async Task<Guid> GetOrganizationIdAsync(HttpClient client)
    {
        var organizations = await client.GetFromJsonAsync<OrganizationResponse[]>("/api/v1/organizations");
        return Assert.Single(organizations!).Id;
    }

    private static async Task<Guid> GetUserIdAsync(DigiSayApiFactory factory, string email)
    {
        using var scope = factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<DigiSayUser>>();
        var user = await userManager.FindByEmailAsync(email);
        Assert.NotNull(user);
        return user.Id;
    }

    private static IOrganizationContext CreateOrganizationContext(Guid organizationId, Guid userId)
    {
        var context = new OrganizationContext();
        context.Set(organizationId, userId, DigiSayRoles.Admin);
        return context;
    }

    private static async Task<string> RegisterAndSignInAsync(DigiSayApiFactory factory, HttpClient client, string email, string role)
    {
        var registration = await client.PostAsJsonAsync("/api/v1/auth/register", new { email, password = Password });
        Assert.Equal(HttpStatusCode.OK, registration.StatusCode);
        using var confirmation = await factory.ConfirmEmailAsync(client, email);
        Assert.Equal(HttpStatusCode.OK, confirmation.StatusCode);

        using (var scope = factory.Services.CreateScope())
        {
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<DigiSayUser>>();
            var user = await userManager.FindByEmailAsync(email);
            Assert.NotNull(user);
            var roleResult = await userManager.AddToRoleAsync(user!, role);
            Assert.True(roleResult.Succeeded, string.Join("; ", roleResult.Errors.Select(error => error.Description)));
        }

        var login = await client.PostAsJsonAsync("/api/v1/auth/login?useCookies=false", new { email, password = Password });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        using var document = await JsonDocument.ParseAsync(await login.Content.ReadAsStreamAsync());
        return document.RootElement.GetProperty("accessToken").GetString()!;
    }

    private sealed record OrganizationResponse(Guid Id, string Name, string MembershipRole);
    private sealed record LeadResponse(Guid Id, string Name, string Email, string? Phone, string? Source, string Status, Guid CreatedByUserId, Guid UpdatedByUserId, DateTimeOffset CreatedAtUtc, DateTimeOffset UpdatedAtUtc);
    private sealed record ServiceRequestResponse(Guid Id, string Title, string Description, string Service, string Status, Guid CreatedByUserId, Guid UpdatedByUserId, DateTimeOffset CreatedAtUtc, DateTimeOffset UpdatedAtUtc);
    private sealed record LeadStatusHistoryResponse(Guid Id, Guid LeadId, string? FromStatus, string ToStatus, Guid ChangedByUserId, DateTimeOffset ChangedAtUtc);
    private sealed record LeadNoteResponse(Guid Id, Guid LeadId, string Content, Guid CreatedByUserId, DateTimeOffset CreatedAtUtc);
    private sealed record LeadFollowUpResponse(Guid Id, Guid LeadId, string Title, string? Details, DateTimeOffset DueAtUtc, Guid CreatedByUserId, DateTimeOffset CreatedAtUtc, DateTimeOffset? CompletedAtUtc, Guid? CompletedByUserId);
    private sealed record PagedResponse<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount, int TotalPages);

}
