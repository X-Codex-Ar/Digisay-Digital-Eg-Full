using DigiSay.Application.ContactInquiries;
using DigiSay.Domain;
using Xunit;

namespace DigiSay.Backend.UnitTests;

public sealed class ArchitectureBoundaryTests
{
    [Fact]
    public void Domain_does_not_depend_on_application_infrastructure_or_web_frameworks()
    {
        var dependencies = typeof(ContactInquiry).Assembly.GetReferencedAssemblies()
            .Select(assembly => assembly.Name ?? string.Empty);

        Assert.DoesNotContain(dependencies, name => name.StartsWith("DigiSay.Application", StringComparison.Ordinal));
        Assert.DoesNotContain(dependencies, name => name.StartsWith("DigiSay.Infrastructure", StringComparison.Ordinal));
        Assert.DoesNotContain(dependencies, name => name.StartsWith("Microsoft.AspNetCore", StringComparison.Ordinal));
        Assert.DoesNotContain(dependencies, name => name.StartsWith("Microsoft.EntityFrameworkCore", StringComparison.Ordinal));
    }

    [Fact]
    public void Application_does_not_depend_on_infrastructure_or_web_frameworks()
    {
        var dependencies = typeof(IContactInquiryWriter).Assembly.GetReferencedAssemblies()
            .Select(assembly => assembly.Name ?? string.Empty);

        Assert.DoesNotContain(dependencies, name => name.StartsWith("DigiSay.Infrastructure", StringComparison.Ordinal));
        Assert.DoesNotContain(dependencies, name => name.StartsWith("Microsoft.AspNetCore", StringComparison.Ordinal));
        Assert.DoesNotContain(dependencies, name => name.StartsWith("Microsoft.EntityFrameworkCore", StringComparison.Ordinal));
    }
}
