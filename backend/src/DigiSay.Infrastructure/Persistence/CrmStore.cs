using System.Text.Json;
using DigiSay.Application.Common.Pagination;
using DigiSay.Application.Features.CRM.Leads.Abstractions;
using DigiSay.Application.Features.CRM.ServiceRequests.Abstractions;
using DigiSay.Domain.Entities.CRM;
using Microsoft.EntityFrameworkCore;

namespace DigiSay.Infrastructure.Persistence;

internal sealed class CrmStore(DigiSayDbContext dbContext) : ILeadStore, IServiceRequestStore
{
    public async Task AddAsync(Lead lead, CancellationToken cancellationToken)
    {
        dbContext.Leads.Add(lead);
        await SaveChangesAsync(cancellationToken);
    }

    public async Task AddAsync(ServiceRequest request, CancellationToken cancellationToken)
    {
        dbContext.ServiceRequests.Add(request);
        await SaveChangesAsync(cancellationToken);
    }

    public Task<Lead?> FindLeadAsync(Guid organizationId, Guid id, CancellationToken cancellationToken) =>
        dbContext.Leads.SingleOrDefaultAsync(
            lead => lead.OrganizationId == organizationId && lead.Id == id,
            cancellationToken);

    public Task<ServiceRequest?> FindServiceRequestAsync(Guid organizationId, Guid id, CancellationToken cancellationToken) =>
        dbContext.ServiceRequests.SingleOrDefaultAsync(
            request => request.OrganizationId == organizationId && request.Id == id,
            cancellationToken);

    public async Task<PageSlice<Lead>> ListLeadsAsync(Guid organizationId, int skip, int take, CancellationToken cancellationToken)
    {
        var query = dbContext.Leads.AsNoTracking().Where(lead => lead.OrganizationId == organizationId);
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(lead => lead.CreatedAtUtc)
            .ThenBy(lead => lead.Id)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);

        return new PageSlice<Lead>(items, totalCount);
    }

    public async Task<PageSlice<ServiceRequest>> ListServiceRequestsAsync(Guid organizationId, int skip, int take, CancellationToken cancellationToken)
    {
        var query = dbContext.ServiceRequests.AsNoTracking()
            .Where(request => request.OrganizationId == organizationId);
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(request => request.CreatedAtUtc)
            .ThenBy(request => request.Id)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);

        return new PageSlice<ServiceRequest>(items, totalCount);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        AppendOutboxEvents();
        return dbContext.SaveChangesAsync(cancellationToken);
    }

    private void AppendOutboxEvents()
    {
        var now = DateTimeOffset.UtcNow;
        foreach (var entry in dbContext.ChangeTracker.Entries()
                     .Where(entry => entry.State is EntityState.Added or EntityState.Modified)
                     .ToArray())
        {
            switch (entry.Entity)
            {
                case Lead lead:
                    dbContext.OutboxMessages.Add(OutboxMessage.Create(
                        entry.State == EntityState.Added ? "crm.lead.created.v1" : "crm.lead.updated.v1",
                        JsonSerializer.Serialize(new { lead.OrganizationId, lead.Id, Status = lead.Status.ToString() }),
                        now));
                    break;
                case ServiceRequest request:
                    dbContext.OutboxMessages.Add(OutboxMessage.Create(
                        entry.State == EntityState.Added ? "crm.service-request.created.v1" : "crm.service-request.updated.v1",
                        JsonSerializer.Serialize(new { request.OrganizationId, request.Id, Status = request.Status.ToString() }),
                        now));
                    break;
            }
        }
    }
}
