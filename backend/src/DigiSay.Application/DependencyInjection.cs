using DigiSay.Application.Features.ContactInquiries;
using DigiSay.Application.Common.Organizations;
using DigiSay.Application.Features.CRM.Leads.Commands.CreateLead;
using DigiSay.Application.Features.CRM.Leads.Commands.UpdateLead;
using DigiSay.Application.Features.CRM.Leads.Commands.TransitionLead;
using DigiSay.Application.Features.CRM.Leads.Commands.AddLeadNote;
using DigiSay.Application.Features.CRM.Leads.Commands.CreateLeadFollowUp;
using DigiSay.Application.Features.CRM.Leads.Commands.CompleteLeadFollowUp;
using DigiSay.Application.Features.CRM.Leads.Queries.GetLead;
using DigiSay.Application.Features.CRM.Leads.Queries.ListLeads;
using DigiSay.Application.Features.CRM.Leads.Queries.ListLeadNotes;
using DigiSay.Application.Features.CRM.Leads.Queries.ListLeadFollowUps;
using DigiSay.Application.Features.CRM.Leads.Queries.ListLeadStatusHistory;
using DigiSay.Application.Features.CRM.ServiceRequests.Commands.CreateServiceRequest;
using DigiSay.Application.Features.CRM.ServiceRequests.Commands.UpdateServiceRequest;
using DigiSay.Application.Features.CRM.ServiceRequests.Commands.TransitionServiceRequest;
using DigiSay.Application.Features.CRM.ServiceRequests.Queries.GetServiceRequest;
using DigiSay.Application.Features.CRM.ServiceRequests.Queries.ListServiceRequests;
using DigiSay.Application.Features.Organizations.Commands.CreateOrganization;
using DigiSay.Application.Features.Organizations.Queries.ListMyOrganizations;
using DigiSay.Application.Features.Organizations.Queries.GetCurrentOrganization;
using DigiSay.Application.Features.Content.Commands.UploadObject;
using DigiSay.Application.Features.Content.Commands.DeleteObject;
using DigiSay.Application.Features.Content.Queries.CreateDownloadLink;
using DigiSay.Application.Features.Content.Queries.GetObject;
using Microsoft.Extensions.DependencyInjection;

namespace DigiSay.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<CreateContactInquiryHandler>();
        services.AddScoped<OrganizationContext>();
        services.AddScoped<IOrganizationContext>(provider => provider.GetRequiredService<OrganizationContext>());
        services.AddScoped<CreateOrganizationHandler>();
        services.AddScoped<ListMyOrganizationsHandler>();
        services.AddScoped<GetCurrentOrganizationHandler>();
        services.AddScoped<UploadObjectHandler>();
        services.AddScoped<CreateDownloadLinkHandler>();
        services.AddScoped<DeleteObjectHandler>();
        services.AddScoped<GetObjectHandler>();
        services.AddScoped<CreateLeadHandler>();
        services.AddScoped<GetLeadHandler>();
        services.AddScoped<ListLeadsHandler>();
        services.AddScoped<UpdateLeadHandler>();
        services.AddScoped<TransitionLeadHandler>();
        services.AddScoped<AddLeadNoteHandler>();
        services.AddScoped<CreateLeadFollowUpHandler>();
        services.AddScoped<CompleteLeadFollowUpHandler>();
        services.AddScoped<ListLeadNotesHandler>();
        services.AddScoped<ListLeadFollowUpsHandler>();
        services.AddScoped<ListLeadStatusHistoryHandler>();
        services.AddScoped<CreateServiceRequestHandler>();
        services.AddScoped<GetServiceRequestHandler>();
        services.AddScoped<ListServiceRequestsHandler>();
        services.AddScoped<UpdateServiceRequestHandler>();
        services.AddScoped<TransitionServiceRequestHandler>();
        return services;
    }
}
