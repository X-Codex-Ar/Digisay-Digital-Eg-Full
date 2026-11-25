using DigiSay.Infrastructure.Identity;
using DigiSay.Domain.Entities.Content;
using DigiSay.Domain.Entities.Organizations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiSay.Infrastructure.Persistence;

internal sealed class StorageObjectRecordConfiguration : IEntityTypeConfiguration<StorageObjectRecord>
{
    public void Configure(EntityTypeBuilder<StorageObjectRecord> builder)
    {
        builder.ToTable("StorageObjects", "content");
        builder.HasKey(item => item.Id);
        builder.Property(item => item.Id).ValueGeneratedNever();
        builder.Property(item => item.OrganizationId).IsRequired();
        builder.Property(item => item.CreatedByUserId).IsRequired();
        builder.Property(item => item.ContentType).HasMaxLength(100).IsRequired();
        builder.Property(item => item.SizeBytes).IsRequired();
        builder.Property(item => item.CreatedAtUtc).HasPrecision(3).IsRequired();
        builder.HasOne<Organization>()
            .WithMany()
            .HasForeignKey(item => item.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne<DigiSayUser>()
            .WithMany()
            .HasForeignKey(item => item.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(item => new { item.OrganizationId, item.CreatedAtUtc });
    }
}
