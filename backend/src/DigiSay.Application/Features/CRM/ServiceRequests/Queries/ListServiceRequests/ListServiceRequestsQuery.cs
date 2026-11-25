using DigiSay.Domain.Enums;

namespace DigiSay.Application.Features.CRM.ServiceRequests.Queries.ListServiceRequests;

public sealed record ListServiceRequestsQuery(int Skip, int Take, string? Search = null, ServiceRequestStatus? Status = null);
