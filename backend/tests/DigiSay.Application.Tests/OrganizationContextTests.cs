using DigiSay.Application.Common.Organizations;
using Xunit;

namespace DigiSay.Application.Tests;

public sealed class OrganizationContextTests
{
    [Fact]
    public void Set_requires_ids_and_a_role_before_assigning_scope()
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
