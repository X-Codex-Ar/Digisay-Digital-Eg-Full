using DigiSay.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiSay.Infrastructure.Persistence;

internal sealed class ContactInquiryConfiguration : IEntityTypeConfiguration<ContactInquiry>
{
    public void Configure(EntityTypeBuilder<ContactInquiry> builder)
    {
        builder.ToTable("ContactInquiries", "dbo");
        builder.HasKey(inquiry => inquiry.Id);
        builder.Property(inquiry => inquiry.Id).ValueGeneratedNever();
        builder.Property(inquiry => inquiry.FirstName).HasMaxLength(50).IsRequired();
        builder.Property(inquiry => inquiry.LastName).HasMaxLength(50).IsRequired();
        builder.Property(inquiry => inquiry.Email).HasMaxLength(254).IsRequired();
        builder.Property(inquiry => inquiry.Phone).HasMaxLength(25);
        builder.Property(inquiry => inquiry.Service).HasMaxLength(80).IsRequired();
        builder.Property(inquiry => inquiry.Message).HasMaxLength(2000);
        builder.Property(inquiry => inquiry.CreatedAtUtc).HasPrecision(3).IsRequired();
        builder.Property(inquiry => inquiry.SourceIp).HasMaxLength(45);
        builder.HasIndex(inquiry => inquiry.CreatedAtUtc);
        builder.HasIndex(inquiry => inquiry.Email);
    }
}
