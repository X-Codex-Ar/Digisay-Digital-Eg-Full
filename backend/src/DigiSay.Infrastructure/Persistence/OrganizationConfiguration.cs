using DigiSay.Domain.Entities.Organizations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiSay.Infrastructure.Persistence;

internal sealed class OrganizationConfiguration : IEntityTypeConfiguration<Organization>
{
    public void Configure(EntityTypeBuilder<Organization> builder)
    {
        builder.ToTable("Organizations", "organizations");
        builder.HasKey(organization => organization.Id);
        builder.Property(organization => organization.Id).ValueGeneratedNever();
        builder.Property(organization => organization.Name).HasMaxLength(120).IsRequired();
        builder.Property(organization => organization.CreatedAtUtc).HasPrecision(3).IsRequired();
        builder.HasIndex(organization => organization.Name);
    }
}
