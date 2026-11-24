using DigiSay.Domain.Organizations;
using Xunit;

namespace DigiSay.Backend.UnitTests;

public sealed class OrganizationTests
{
    [Fact]
    public void Create_trims_name_and_records_creation_time()
    {
        var before = DateTimeOffset.UtcNow;

        var organization = Organization.Create("  DigiSay  ");

        Assert.NotEqual(Guid.Empty, organization.Id);
        Assert.Equal("DigiSay", organization.Name);
        Assert.InRange(organization.CreatedAtUtc, before, DateTimeOffset.UtcNow);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData("A")]
    public void Create_rejects_names_shorter_than_two_characters(string name)
    {
        Assert.Throws<ArgumentException>(() => Organization.Create(name));
    }

    [Fact]
    public void CreateOwner_grants_an_active_membership_only_for_valid_ids()
    {
        var organizationId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var membership = OrganizationMembership.CreateOwner(organizationId, userId);

        Assert.Equal(organizationId, membership.OrganizationId);
        Assert.Equal(userId, membership.UserId);
        Assert.Equal("Owner", membership.Role);
        Assert.Equal(OrganizationMembershipStatus.Active, membership.Status);
        Assert.Throws<ArgumentException>(() => OrganizationMembership.CreateOwner(Guid.Empty, userId));
        Assert.Throws<ArgumentException>(() => OrganizationMembership.CreateOwner(organizationId, Guid.Empty));
    }
}
