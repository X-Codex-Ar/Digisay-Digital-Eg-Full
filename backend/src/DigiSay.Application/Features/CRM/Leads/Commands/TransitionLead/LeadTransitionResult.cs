using DigiSay.Domain.Entities.CRM;

namespace DigiSay.Application.Features.CRM.Leads.Commands.TransitionLead;

public sealed record LeadTransitionResult(bool Found, bool Transitioned, Lead? Lead);
