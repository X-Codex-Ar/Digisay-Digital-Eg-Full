namespace DigiSay.Application.Features.CRM.Leads.Commands.CreateLeadFollowUp;

public sealed record CreateLeadFollowUpCommand(string Title, string? Details, DateTimeOffset DueAtUtc);
