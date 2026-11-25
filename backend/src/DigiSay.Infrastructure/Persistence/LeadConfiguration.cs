using DigiSay.Domain.Entities.CRM;
using DigiSay.Domain.Entities.Organizations;
using DigiSay.Infrastructure.Identity;
using DigiSay.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiSay.Infrastructure.Persistence;

internal sealed class LeadConfiguration : IEntityTypeConfiguration<Lead>
{
    public void Configure(EntityTypeBuilder<Lead> builder)
    {
        builder.ToTable("Leads", "crm");
        builder.HasKey(lead => new { lead.OrganizationId, lead.Id });
        builder.Property(lead => lead.Id).ValueGeneratedNever();
        builder.Property(lead => lead.Name).HasMaxLength(150).IsRequired();
        builder.Property(lead => lead.Email)
            .HasConversion(email => email.Value, value => EmailAddress.Create(value))
            .HasMaxLength(254)
            .IsRequired();
        builder.Property(lead => lead.Phone).HasMaxLength(25);
        builder.Property(lead => lead.Source).HasMaxLength(80);
        builder.Property(lead => lead.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(lead => lead.CreatedAtUtc).HasPrecision(3).IsRequired();
        builder.Property(lead => lead.UpdatedAtUtc).HasPrecision(3).IsRequired();
        builder.HasOne<Organization>()
            .WithMany()
            .HasForeignKey(lead => lead.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne<DigiSayUser>()
            .WithMany()
            .HasForeignKey(lead => lead.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<DigiSayUser>()
            .WithMany()
            .HasForeignKey(lead => lead.UpdatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(lead => new { lead.OrganizationId, lead.CreatedAtUtc, lead.Id })
            .IsDescending(false, true, false)
            .HasDatabaseName("IX_Leads_OrganizationId_CreatedAtUtc_Id");
    }
}
