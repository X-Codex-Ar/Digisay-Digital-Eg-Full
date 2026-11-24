using DigiSay.Domain.Enums;

namespace DigiSay.Application.Features.CRM.ServiceRequests.Commands.TransitionServiceRequest;

public sealed record TransitionServiceRequestCommand(ServiceRequestStatus TargetStatus);
