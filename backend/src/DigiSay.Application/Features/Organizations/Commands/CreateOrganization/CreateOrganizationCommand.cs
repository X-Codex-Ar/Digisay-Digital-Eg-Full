namespace DigiSay.Application.Features.Organizations.Commands.CreateOrganization;

public sealed record CreateOrganizationCommand(string Name, Guid OwnerUserId);
