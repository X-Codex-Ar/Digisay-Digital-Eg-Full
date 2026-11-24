using DigiSay.Application.ContactInquiries;
using Microsoft.Extensions.DependencyInjection;

namespace DigiSay.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<CreateContactInquiryHandler>();
        return services;
    }
}
