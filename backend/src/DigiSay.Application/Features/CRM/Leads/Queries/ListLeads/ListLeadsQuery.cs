using DigiSay.Domain.Enums;

namespace DigiSay.Application.Features.CRM.Leads.Queries.ListLeads;

public sealed record ListLeadsQuery(int Skip, int Take, string? Search = null, LeadStatus? Status = null);
