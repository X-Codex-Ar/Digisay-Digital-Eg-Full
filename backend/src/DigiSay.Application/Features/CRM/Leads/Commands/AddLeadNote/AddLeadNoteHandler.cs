using DigiSay.Application.Common.Organizations;
using DigiSay.Application.Features.CRM.Leads.Abstractions;
using DigiSay.Domain.Entities.CRM;

namespace DigiSay.Application.Features.CRM.Leads.Commands.AddLeadNote;

public sealed class AddLeadNoteHandler(ILeadStore store)
{
    public async Task<LeadNote?> HandleAsync(Guid leadId, AddLeadNoteCommand command, IOrganizationContext scope, CancellationToken cancellationToken)
    {
        if (await store.FindLeadAsync(scope.OrganizationId, leadId, cancellationToken) is null) return null;
        var note = LeadNote.Create(scope.OrganizationId, leadId, command.Content, scope.UserId);
        await store.AddNoteAsync(note, cancellationToken);
        return note;
    }
}
