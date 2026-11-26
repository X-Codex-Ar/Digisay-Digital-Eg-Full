using DigiSay.Application.Common.Organizations;
using DigiSay.Application.Features.CRM.Leads.Abstractions;
using DigiSay.Domain.Entities.CRM;

namespace DigiSay.Application.Features.CRM.Leads.Commands.TransitionLead;

public sealed class TransitionLeadHandler(ILeadStore store)
{
    public async Task<LeadTransitionResult> HandleAsync(Guid id, TransitionLeadCommand command, IOrganizationContext scope, CancellationToken cancellationToken)
    {
        var lead = await store.FindLeadAsync(scope.OrganizationId, id, cancellationToken);
        if (lead is null) return new LeadTransitionResult(false, false, null);
        var previousStatus = lead.Status;
        if (!lead.TryTransitionTo(command.TargetStatus, scope.UserId)) return new LeadTransitionResult(true, false, lead);
        store.AddStatusHistory(LeadStatusHistory.Create(scope.OrganizationId, lead.Id, previousStatus, command.TargetStatus, scope.UserId));
        await store.SaveChangesAsync(cancellationToken);
        return new LeadTransitionResult(true, true, lead);
    }
}
