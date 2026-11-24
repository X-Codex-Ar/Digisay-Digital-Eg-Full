using DigiSay.Domain.Organizations;
using DigiSay.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiSay.Infrastructure.Persistence;

internal sealed class OrganizationMembershipConfiguration : IEntityTypeConfiguration<OrganizationMembership>
{
    public void Configure(EntityTypeBuilder<OrganizationMembership> builder)
    {
        builder.ToTable("OrganizationMemberships", "organizations");
        builder.HasKey(membership => new { membership.OrganizationId, membership.UserId });
        builder.Property(membership => membership.Role).HasMaxLength(40).IsRequired();
        builder.Property(membership => membership.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(membership => membership.CreatedAtUtc).HasPrecision(3).IsRequired();
        builder.HasOne(membership => membership.Organization)
            .WithMany()
            .HasForeignKey(membership => membership.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne<DigiSayUser>()
            .WithMany()
            .HasForeignKey(membership => membership.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(membership => new { membership.UserId, membership.Status });
    }
}
