using DigiSay.Application.Common;
using DigiSay.Application.Common.Pagination;
using DigiSay.Application.Features.CRM.Leads.Abstractions;
using DigiSay.Application.Features.CRM.ServiceRequests.Abstractions;
using DigiSay.Domain.Entities.CRM;
using DigiSay.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace DigiSay.Infrastructure.Persistence;

internal sealed class CrmStore(DigiSayDbContext dbContext) : ILeadStore, IServiceRequestStore
{
    public async Task AddAsync(Lead lead, CancellationToken cancellationToken)
    {
        dbContext.Leads.Add(lead);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public void AddStatusHistory(LeadStatusHistory history) => dbContext.LeadStatusHistory.Add(history);

    public async Task AddAsync(ServiceRequest request, CancellationToken cancellationToken)
    {
        dbContext.ServiceRequests.Add(request);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public Task<Lead?> FindLeadAsync(Guid organizationId, Guid id, CancellationToken cancellationToken) =>
        dbContext.Leads.SingleOrDefaultAsync(
            lead => lead.OrganizationId == organizationId && lead.Id == id,
            cancellationToken);

    public Task<ServiceRequest?> FindServiceRequestAsync(Guid organizationId, Guid id, CancellationToken cancellationToken) =>
        dbContext.ServiceRequests.SingleOrDefaultAsync(
            request => request.OrganizationId == organizationId && request.Id == id,
            cancellationToken);

    public async Task<PageSlice<Lead>> ListLeadsAsync(Guid organizationId, int skip, int take, string? search, LeadStatus? status, CancellationToken cancellationToken)
    {
        var query = dbContext.Leads.AsNoTracking().Where(lead => lead.OrganizationId == organizationId);
        if (status.HasValue) query = query.Where(lead => lead.Status == status.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            var emailPattern = $"%{EscapeLikePattern(term.ToLowerInvariant())}%";
            const string emailSearchSql = "SELECT * FROM [" + LeadConfiguration.SchemaName + "].[" +
                LeadConfiguration.TableName + "] WHERE [" + LeadConfiguration.EmailColumnName + "] LIKE {0} ESCAPE '\\'";
            var emailLeadIds = dbContext.Leads
                .FromSqlRaw(emailSearchSql, emailPattern)
                .Select(lead => lead.Id);

            query = query.Where(lead => lead.Name.Contains(term) ||
                (lead.Phone != null && lead.Phone.Contains(term)) ||
                (lead.Source != null && lead.Source.Contains(term)) ||
                emailLeadIds.Contains(lead.Id));
        }
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(lead => lead.CreatedAtUtc)
            .ThenBy(lead => lead.Id)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);

        return new PageSlice<Lead>(items, totalCount);
    }

    public async Task AddNoteAsync(LeadNote note, CancellationToken cancellationToken)
    {
        dbContext.LeadNotes.Add(note);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<PageSlice<LeadNote>> ListNotesAsync(Guid organizationId, Guid leadId, int skip, int take, CancellationToken cancellationToken)
    {
        var query = dbContext.LeadNotes.AsNoTracking().Where(note => note.OrganizationId == organizationId && note.LeadId == leadId);
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.OrderByDescending(note => note.CreatedAtUtc).ThenBy(note => note.Id)
            .Skip(skip).Take(take).ToListAsync(cancellationToken);
        return new PageSlice<LeadNote>(items, totalCount);
    }

    public async Task AddFollowUpAsync(LeadFollowUp followUp, CancellationToken cancellationToken)
    {
        dbContext.LeadFollowUps.Add(followUp);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public Task<LeadFollowUp?> FindFollowUpAsync(Guid organizationId, Guid leadId, Guid followUpId, CancellationToken cancellationToken) =>
        dbContext.LeadFollowUps.SingleOrDefaultAsync(item => item.OrganizationId == organizationId && item.LeadId == leadId && item.Id == followUpId, cancellationToken);

    public async Task<PageSlice<LeadFollowUp>> ListFollowUpsAsync(Guid organizationId, Guid leadId, int skip, int take, CancellationToken cancellationToken)
    {
        var query = dbContext.LeadFollowUps.AsNoTracking().Where(item => item.OrganizationId == organizationId && item.LeadId == leadId);
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.OrderBy(item => item.CompletedAtUtc.HasValue).ThenBy(item => item.DueAtUtc).ThenBy(item => item.Id)
            .Skip(skip).Take(take).ToListAsync(cancellationToken);
        return new PageSlice<LeadFollowUp>(items, totalCount);
    }

    public async Task<PageSlice<LeadStatusHistory>> ListStatusHistoryAsync(Guid organizationId, Guid leadId, int skip, int take, CancellationToken cancellationToken)
    {
        var query = dbContext.LeadStatusHistory.AsNoTracking().Where(item => item.OrganizationId == organizationId && item.LeadId == leadId);
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.OrderByDescending(item => item.ChangedAtUtc).ThenBy(item => item.Id)
            .Skip(skip).Take(take).ToListAsync(cancellationToken);
        return new PageSlice<LeadStatusHistory>(items, totalCount);
    }

    public async Task<PageSlice<ServiceRequest>> ListServiceRequestsAsync(Guid organizationId, int skip, int take, string? search, ServiceRequestStatus? status, CancellationToken cancellationToken)
    {
        var query = dbContext.ServiceRequests.AsNoTracking()
            .Where(request => request.OrganizationId == organizationId);
        if (status.HasValue) query = query.Where(request => request.Status == status.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(request => request.Title.Contains(term) || request.Description.Contains(term) || request.Service.Contains(term));
        }
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(request => request.CreatedAtUtc)
            .ThenBy(request => request.Id)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);

        return new PageSlice<ServiceRequest>(items, totalCount);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException exception)
        {
            throw new ConcurrencyConflictException("The record was changed by another request.", exception);
        }
    }

    private static string EscapeLikePattern(string value) => value
        .Replace("\\", "\\\\", StringComparison.Ordinal)
        .Replace("%", "\\%", StringComparison.Ordinal)
        .Replace("_", "\\_", StringComparison.Ordinal)
        .Replace("[", "[[]", StringComparison.Ordinal);
}
