namespace DigiSay.Application.Features.Organizations.Queries.GetCurrentOrganization;

public sealed record GetCurrentOrganizationQuery(Guid OrganizationId, string MembershipRole);
