using DigiSay.Application.Common.Organizations;
using DigiSay.Application.Features.CRM.Leads.Abstractions;
using DigiSay.Domain.Entities.CRM;

namespace DigiSay.Application.Features.CRM.Leads.Commands.UpdateLead;

public sealed class UpdateLeadHandler(ILeadStore store)
{
    public async Task<Lead?> HandleAsync(Guid id, UpdateLeadCommand command, IOrganizationContext scope, CancellationToken cancellationToken)
    {
        var lead = await store.FindLeadAsync(scope.OrganizationId, id, cancellationToken);
        if (lead is null) return null;
        lead.Update(command.Name, command.Email, command.Phone, command.Source, scope.UserId);
        await store.SaveChangesAsync(cancellationToken);
        return lead;
    }
}
