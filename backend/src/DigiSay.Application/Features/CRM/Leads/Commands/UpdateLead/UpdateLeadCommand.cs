namespace DigiSay.Application.Features.CRM.Leads.Commands.UpdateLead;

public sealed record UpdateLeadCommand(string Name, string Email, string? Phone, string? Source);
