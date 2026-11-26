using DigiSay.Application.Common.Organizations;
using DigiSay.Application.Features.CRM.Leads.Abstractions;
using DigiSay.Domain.Entities.CRM;

namespace DigiSay.Application.Features.CRM.Leads.Commands.CreateLead;

public sealed class CreateLeadHandler(ILeadStore store)
{
    public async Task<Lead> HandleAsync(CreateLeadCommand command, IOrganizationContext scope, CancellationToken cancellationToken)
    {
        var lead = Lead.Create(scope.OrganizationId, command.Name, command.Email, command.Phone, command.Source, scope.UserId);
        store.AddStatusHistory(LeadStatusHistory.Create(scope.OrganizationId, lead.Id, null, lead.Status, scope.UserId));
        await store.AddAsync(lead, cancellationToken);
        return lead;
    }
}
