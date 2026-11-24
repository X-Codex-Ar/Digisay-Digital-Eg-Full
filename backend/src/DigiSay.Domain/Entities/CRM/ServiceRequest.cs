using DigiSay.Domain.Abstractions;
using DigiSay.Domain.Enums;
using DigiSay.Domain.Exceptions;

namespace DigiSay.Domain.Entities.CRM;

public sealed class ServiceRequest : IOrganizationOwned
{
    private ServiceRequest() { }

    public Guid Id { get; private set; }
    public Guid OrganizationId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string Service { get; private set; } = string.Empty;
    public ServiceRequestStatus Status { get; private set; }
    public Guid CreatedByUserId { get; private set; }
    public Guid UpdatedByUserId { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; }

    public static ServiceRequest Create(
        Guid organizationId,
        string title,
        string description,
        string service,
        Guid actorUserId)
    {
        if (organizationId == Guid.Empty || actorUserId == Guid.Empty)
        {
            throw new DomainValidationException(nameof(organizationId), "Organization and actor ids are required.");
        }

        var normalizedTitle = title?.Trim();
        var normalizedDescription = description?.Trim();
        var normalizedService = service?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedTitle) || normalizedTitle.Length is < 3 or > 150)
        {
            throw new DomainValidationException(nameof(Title), "Request title must contain 3 to 150 characters.");
        }

        if (string.IsNullOrWhiteSpace(normalizedDescription) || normalizedDescription.Length > 2000)
        {
            throw new DomainValidationException(nameof(Description), "A request description of at most 2000 characters is required.");
        }

        if (string.IsNullOrWhiteSpace(normalizedService) || normalizedService.Length is < 2 or > 80)
        {
            throw new DomainValidationException(nameof(Service), "Service must contain 2 to 80 characters.");
        }

        var now = DateTimeOffset.UtcNow;
        return new ServiceRequest
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            Title = normalizedTitle,
            Description = normalizedDescription,
            Service = normalizedService,
            Status = ServiceRequestStatus.Submitted,
            CreatedByUserId = actorUserId,
            UpdatedByUserId = actorUserId,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };
    }

    public void Update(string title, string description, string service, Guid actorUserId)
    {
        var normalizedTitle = title?.Trim();
        var normalizedDescription = description?.Trim();
        var normalizedService = service?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedTitle) || normalizedTitle.Length is < 3 or > 150)
        {
            throw new DomainValidationException(nameof(Title), "Request title must contain 3 to 150 characters.");
        }

        if (string.IsNullOrWhiteSpace(normalizedDescription) || normalizedDescription.Length > 2000)
        {
            throw new DomainValidationException(nameof(Description), "A request description of at most 2000 characters is required.");
        }

        if (string.IsNullOrWhiteSpace(normalizedService) || normalizedService.Length is < 2 or > 80)
        {
            throw new DomainValidationException(nameof(Service), "Service must contain 2 to 80 characters.");
        }

        if (actorUserId == Guid.Empty)
        {
            throw new DomainValidationException(nameof(actorUserId), "Actor id is required.");
        }

        Title = normalizedTitle;
        Description = normalizedDescription;
        Service = normalizedService;
        RecordUpdate(actorUserId);
    }

    public bool TryTransitionTo(ServiceRequestStatus target, Guid actorUserId)
    {
        var allowed = Status switch
        {
            ServiceRequestStatus.Submitted => target is ServiceRequestStatus.UnderReview or ServiceRequestStatus.Cancelled,
            ServiceRequestStatus.UnderReview => target is ServiceRequestStatus.Approved or ServiceRequestStatus.Declined or ServiceRequestStatus.Cancelled,
            ServiceRequestStatus.Approved => target is ServiceRequestStatus.InProgress or ServiceRequestStatus.Cancelled,
            ServiceRequestStatus.InProgress => target is ServiceRequestStatus.Completed or ServiceRequestStatus.Cancelled,
            _ => false,
        };

        if (!allowed || actorUserId == Guid.Empty)
        {
            return false;
        }

        Status = target;
        RecordUpdate(actorUserId);
        return true;
    }

    private void RecordUpdate(Guid actorUserId)
    {
        UpdatedByUserId = actorUserId;
        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }
}
