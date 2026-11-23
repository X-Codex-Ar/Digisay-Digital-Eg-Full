using DigiSay.Domain;
using Microsoft.EntityFrameworkCore;

namespace DigiSay.Infrastructure.Persistence;

/// <summary>SQL Server boundary for authoritative business data.</summary>
public sealed class DigiSayDbContext(DbContextOptions<DigiSayDbContext> options)
    : DbContext(options)
{
    public DbSet<ContactInquiry> ContactInquiries => Set<ContactInquiry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(DigiSayDbContext).Assembly);
}
