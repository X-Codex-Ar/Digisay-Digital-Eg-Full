using DigiSay.Application.Common.Organizations;
using DigiSay.Application.Features.CRM.Leads.Abstractions;
using DigiSay.Domain.Entities.CRM;

namespace DigiSay.Application.Features.CRM.Leads.Commands.CreateLeadFollowUp;

public sealed class CreateLeadFollowUpHandler(ILeadStore store)
{
    public async Task<LeadFollowUp?> HandleAsync(Guid leadId, CreateLeadFollowUpCommand command, IOrganizationContext scope, CancellationToken cancellationToken)
    {
        if (await store.FindLeadAsync(scope.OrganizationId, leadId, cancellationToken) is null) return null;
        var followUp = LeadFollowUp.Create(scope.OrganizationId, leadId, command.Title, command.Details, command.DueAtUtc, scope.UserId);
        await store.AddFollowUpAsync(followUp, cancellationToken);
        return followUp;
    }
}
