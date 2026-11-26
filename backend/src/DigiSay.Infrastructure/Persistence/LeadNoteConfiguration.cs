using DigiSay.Domain.Entities.CRM;
using DigiSay.Domain.Entities.Organizations;
using DigiSay.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiSay.Infrastructure.Persistence;

internal sealed class LeadNoteConfiguration : IEntityTypeConfiguration<LeadNote>
{
    public void Configure(EntityTypeBuilder<LeadNote> builder)
    {
        builder.ToTable("LeadNotes", "crm");
        builder.HasKey(note => new { note.OrganizationId, note.Id });
        builder.Property(note => note.Id).ValueGeneratedNever();
        builder.Property(note => note.Content).HasMaxLength(4000).IsRequired();
        builder.Property(note => note.CreatedAtUtc).HasPrecision(3).IsRequired();
        builder.HasOne<Lead>().WithMany().HasForeignKey(note => new { note.OrganizationId, note.LeadId }).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne<Organization>().WithMany().HasForeignKey(note => note.OrganizationId).OnDelete(DeleteBehavior.NoAction);
        builder.HasOne<DigiSayUser>().WithMany().HasForeignKey(note => note.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(note => new { note.OrganizationId, note.LeadId, note.CreatedAtUtc });
    }
}
