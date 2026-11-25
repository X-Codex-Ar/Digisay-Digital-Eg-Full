using DigiSay.Domain.Entities.CRM;
using DigiSay.Domain.Entities.Organizations;
using DigiSay.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiSay.Infrastructure.Persistence;

internal sealed class ServiceRequestConfiguration : IEntityTypeConfiguration<ServiceRequest>
{
    public void Configure(EntityTypeBuilder<ServiceRequest> builder)
    {
        builder.ToTable("ServiceRequests", "crm");
        builder.HasKey(request => new { request.OrganizationId, request.Id });
        builder.Property(request => request.Id).ValueGeneratedNever();
        builder.Property(request => request.Title).HasMaxLength(150).IsRequired();
        builder.Property(request => request.Description).HasMaxLength(2000).IsRequired();
        builder.Property(request => request.Service).HasMaxLength(80).IsRequired();
        builder.Property(request => request.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(request => request.CreatedAtUtc).HasPrecision(3).IsRequired();
        builder.Property(request => request.UpdatedAtUtc).HasPrecision(3).IsRequired();
        builder.HasOne<Organization>()
            .WithMany()
            .HasForeignKey(request => request.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne<DigiSayUser>()
            .WithMany()
            .HasForeignKey(request => request.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<DigiSayUser>()
            .WithMany()
            .HasForeignKey(request => request.UpdatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(request => new { request.OrganizationId, request.CreatedAtUtc, request.Id })
            .IsDescending(false, true, false)
            .HasDatabaseName("IX_ServiceRequests_OrganizationId_CreatedAtUtc_Id");
    }
}
