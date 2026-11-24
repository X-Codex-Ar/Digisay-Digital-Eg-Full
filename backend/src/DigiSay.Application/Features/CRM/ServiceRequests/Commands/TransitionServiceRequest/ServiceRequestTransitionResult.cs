using DigiSay.Domain.Entities.CRM;

namespace DigiSay.Application.Features.CRM.ServiceRequests.Commands.TransitionServiceRequest;

public sealed record ServiceRequestTransitionResult(bool Found, bool Transitioned, ServiceRequest? Request);
