using DigiSay.Domain.Enums;

namespace DigiSay.Application.Features.CRM.Leads.Commands.TransitionLead;

public sealed record TransitionLeadCommand(LeadStatus TargetStatus);
