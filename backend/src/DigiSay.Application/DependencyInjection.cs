using DigiSay.Application.ContactInquiries;
using DigiSay.Application.Organizations;
using Microsoft.Extensions.DependencyInjection;

namespace DigiSay.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<CreateContactInquiryHandler>();
        services.AddScoped<OrganizationContext>();
        services.AddScoped<IOrganizationContext>(provider => provider.GetRequiredService<OrganizationContext>());
        return services;
    }
}
