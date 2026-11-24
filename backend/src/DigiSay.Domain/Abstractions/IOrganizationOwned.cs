namespace DigiSay.Domain.Abstractions;

public interface IOrganizationOwned
{
    Guid OrganizationId { get; }
}
