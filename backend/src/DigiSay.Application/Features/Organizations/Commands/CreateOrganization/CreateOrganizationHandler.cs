using DigiSay.Application.Features.Organizations.Abstractions;
using DigiSay.Domain.Entities.Organizations;

namespace DigiSay.Application.Features.Organizations.Commands.CreateOrganization;

public sealed class CreateOrganizationHandler(IOrganizationStore store)
{
    public async Task<Organization> HandleAsync(CreateOrganizationCommand command, CancellationToken cancellationToken)
    {
        var organization = Organization.Create(command.Name);
        await store.AddAsync(organization, OrganizationMembership.CreateOwner(organization.Id, command.OwnerUserId), cancellationToken);
        return organization;
    }
}
