using DigiSay.Domain.Entities.CRM;
using DigiSay.Domain.Entities.Organizations;
using DigiSay.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiSay.Infrastructure.Persistence;

internal sealed class LeadStatusHistoryConfiguration : IEntityTypeConfiguration<LeadStatusHistory>
{
    public void Configure(EntityTypeBuilder<LeadStatusHistory> builder)
    {
        builder.ToTable("LeadStatusHistory", "crm");
        builder.HasKey(item => new { item.OrganizationId, item.Id });
        builder.Property(item => item.Id).ValueGeneratedNever();
        builder.Property(item => item.FromStatus).HasConversion<string>().HasMaxLength(20);
        builder.Property(item => item.ToStatus).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(item => item.ChangedAtUtc).HasPrecision(3).IsRequired();
        builder.HasOne<Lead>().WithMany().HasForeignKey(item => new { item.OrganizationId, item.LeadId }).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne<Organization>().WithMany().HasForeignKey(item => item.OrganizationId).OnDelete(DeleteBehavior.NoAction);
        builder.HasOne<DigiSayUser>().WithMany().HasForeignKey(item => item.ChangedByUserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(item => new { item.OrganizationId, item.LeadId, item.ChangedAtUtc });
    }
}
