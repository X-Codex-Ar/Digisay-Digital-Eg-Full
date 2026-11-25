using DigiSay.Domain.Entities;
using DigiSay.Infrastructure.Identity;
using DigiSay.Domain.Entities.Organizations;
using DigiSay.Domain.Entities.CRM;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace DigiSay.Infrastructure.Persistence;

/// <summary>SQL Server boundary for authoritative business data.</summary>
public sealed class DigiSayDbContext(DbContextOptions<DigiSayDbContext> options)
    : IdentityDbContext<DigiSayUser, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<ContactInquiry> ContactInquiries => Set<ContactInquiry>();
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<OrganizationMembership> OrganizationMemberships => Set<OrganizationMembership>();
    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<LeadNote> LeadNotes => Set<LeadNote>();
    public DbSet<LeadFollowUp> LeadFollowUps => Set<LeadFollowUp>();
    public DbSet<LeadStatusHistory> LeadStatusHistory => Set<LeadStatusHistory>();
    public DbSet<ServiceRequest> ServiceRequests => Set<ServiceRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(DigiSayDbContext).Assembly);

        modelBuilder.Entity<DigiSayUser>(user =>
        {
            user.Property(account => account.DisplayName).HasMaxLength(100);
            user.HasIndex(account => account.NormalizedEmail)
                .HasDatabaseName("EmailIndex")
                .IsUnique()
                .HasFilter("[NormalizedEmail] IS NOT NULL");
        });

        Guid[] roleIds =
        [
            new("046cab84-4590-45de-8fbd-9ed9bacfed00"),
            new("046cab84-4590-45de-8fbd-9ed9bacfed01"),
            new("046cab84-4590-45de-8fbd-9ed9bacfed02"),
            new("046cab84-4590-45de-8fbd-9ed9bacfed03"),
            new("046cab84-4590-45de-8fbd-9ed9bacfed04"),
            new("046cab84-4590-45de-8fbd-9ed9bacfed05"),
            new("046cab84-4590-45de-8fbd-9ed9bacfed06"),
            new("046cab84-4590-45de-8fbd-9ed9bacfed07"),
            new("046cab84-4590-45de-8fbd-9ed9bacfed08"),
            new("046cab84-4590-45de-8fbd-9ed9bacfed09"),
            new("046cab84-4590-45de-8fbd-9ed9bacfed10"),
        ];

        var roles = DigiSayRoles.All
            .Select((name, index) => new IdentityRole<Guid>
            {
                Id = roleIds[index],
                Name = name,
                NormalizedName = name.ToUpperInvariant(),
                ConcurrencyStamp = roleIds[index].ToString(),
            })
            .ToArray();

        modelBuilder.Entity<IdentityRole<Guid>>().HasData(roles);
    }
}
