using DigiSay.Domain.Entities.CRM;
using DigiSay.Domain.Entities.Organizations;
using DigiSay.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiSay.Infrastructure.Persistence;

internal sealed class LeadFollowUpConfiguration : IEntityTypeConfiguration<LeadFollowUp>
{
    public void Configure(EntityTypeBuilder<LeadFollowUp> builder)
    {
        builder.ToTable("LeadFollowUps", "crm");
        builder.HasKey(item => new { item.OrganizationId, item.Id });
        builder.Property(item => item.Id).ValueGeneratedNever();
        builder.Property(item => item.Title).HasMaxLength(160).IsRequired();
        builder.Property(item => item.Details).HasMaxLength(2000);
        builder.Property(item => item.DueAtUtc).HasPrecision(3).IsRequired();
        builder.Property(item => item.CreatedAtUtc).HasPrecision(3).IsRequired();
        builder.Property(item => item.CompletedAtUtc).HasPrecision(3);
        builder.Property(item => item.RowVersion).IsRowVersion();
        builder.HasOne<Lead>().WithMany().HasForeignKey(item => new { item.OrganizationId, item.LeadId }).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne<Organization>().WithMany().HasForeignKey(item => item.OrganizationId).OnDelete(DeleteBehavior.NoAction);
        builder.HasOne<DigiSayUser>().WithMany().HasForeignKey(item => item.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<DigiSayUser>().WithMany().HasForeignKey(item => item.CompletedByUserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(item => new { item.OrganizationId, item.LeadId, item.CompletedAtUtc, item.DueAtUtc });
    }
}
