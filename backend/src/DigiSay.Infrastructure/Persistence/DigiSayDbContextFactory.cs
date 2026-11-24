using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace DigiSay.Infrastructure.Persistence;

public sealed class DigiSayDbContextFactory : IDesignTimeDbContextFactory<DigiSayDbContext>
{
    public DigiSayDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__SqlServer") ??
            "Server=(localdb)\\MSSQLLocalDB;Database=DigiSay;Trusted_Connection=True;TrustServerCertificate=True";
        var options = new DbContextOptionsBuilder<DigiSayDbContext>()
            .UseSqlServer(connectionString)
            .Options;

        return new DigiSayDbContext(options);
    }
}
