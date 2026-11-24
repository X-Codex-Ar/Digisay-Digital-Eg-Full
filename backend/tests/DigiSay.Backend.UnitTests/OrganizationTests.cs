using DigiSay.Application.Organizations;
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

    [Fact]
    public void OrganizationContext_set_requires_ids_and_a_role_before_assigning_scope()
    {
        var context = new OrganizationContext();
        var organizationId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        Assert.Throws<ArgumentException>(() => context.Set(Guid.Empty, userId, "Owner"));
        Assert.Throws<ArgumentException>(() => context.Set(organizationId, Guid.Empty, "Owner"));
        Assert.Throws<ArgumentException>(() => context.Set(organizationId, userId, " "));

        context.Set(organizationId, userId, " Owner ");

        Assert.Equal(organizationId, context.OrganizationId);
        Assert.Equal(userId, context.UserId);
        Assert.Equal("Owner", context.MembershipRole);
        Assert.Throws<InvalidOperationException>(() => context.Set(Guid.NewGuid(), Guid.NewGuid(), "Member"));
    }
}
