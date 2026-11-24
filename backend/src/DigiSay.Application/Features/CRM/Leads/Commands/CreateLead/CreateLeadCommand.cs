namespace DigiSay.Application.Features.CRM.Leads.Commands.CreateLead;

public sealed record CreateLeadCommand(string Name, string Email, string? Phone, string? Source);
