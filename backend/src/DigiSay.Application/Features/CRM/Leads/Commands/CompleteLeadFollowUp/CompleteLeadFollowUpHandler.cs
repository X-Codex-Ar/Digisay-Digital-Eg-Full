using DigiSay.Application.Common.Organizations;
using DigiSay.Application.Features.CRM.Leads.Abstractions;
using DigiSay.Domain.Entities.CRM;

namespace DigiSay.Application.Features.CRM.Leads.Commands.CompleteLeadFollowUp;

public sealed class CompleteLeadFollowUpHandler(ILeadStore store)
{
    public async Task<(bool Found, bool Completed, LeadFollowUp? FollowUp)> HandleAsync(Guid leadId, Guid followUpId, IOrganizationContext scope, CancellationToken cancellationToken)
    {
        var followUp = await store.FindFollowUpAsync(scope.OrganizationId, leadId, followUpId, cancellationToken);
        if (followUp is null) return (false, false, null);
        if (!followUp.TryComplete(scope.UserId)) return (true, false, followUp);
        await store.SaveChangesAsync(cancellationToken);
        return (true, true, followUp);
    }
}
