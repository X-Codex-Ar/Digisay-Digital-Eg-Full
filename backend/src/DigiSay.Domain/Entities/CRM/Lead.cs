using DigiSay.Domain.Abstractions;
using DigiSay.Domain.Enums;
using DigiSay.Domain.Exceptions;
using DigiSay.Domain.ValueObjects;

namespace DigiSay.Domain.Entities.CRM;

public sealed class Lead : IOrganizationOwned
{
    private Lead() { }

    public Guid Id { get; private set; }
    public Guid OrganizationId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public EmailAddress Email { get; private set; }
    public string? Phone { get; private set; }
    public string? Source { get; private set; }
    public LeadStatus Status { get; private set; }
    public Guid CreatedByUserId { get; private set; }
    public Guid UpdatedByUserId { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; }
    public byte[] RowVersion { get; private set; } = [];

    public static Lead Create(
        Guid organizationId,
        string name,
        string email,
        string? phone,
        string? source,
        Guid actorUserId)
    {
        if (organizationId == Guid.Empty || actorUserId == Guid.Empty)
        {
            throw new DomainValidationException(nameof(organizationId), "Organization and actor ids are required.");
        }

        var normalizedName = name?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedName) || normalizedName.Length is < 2 or > 150)
        {
            throw new DomainValidationException(nameof(Name), "Lead name must contain 2 to 150 characters.");
        }

        var normalizedEmail = EmailAddress.Create(email);

        var now = DateTimeOffset.UtcNow;
        return new Lead
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            Name = normalizedName,
            Email = normalizedEmail,
            Phone = NormalizeOptional(phone, 25, nameof(phone)),
            Source = NormalizeOptional(source, 80, nameof(source)),
            Status = LeadStatus.New,
            CreatedByUserId = actorUserId,
            UpdatedByUserId = actorUserId,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };
    }

    public void Update(string name, string email, string? phone, string? source, Guid actorUserId)
    {
        var normalizedName = name?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedName) || normalizedName.Length is < 2 or > 150)
        {
            throw new DomainValidationException(nameof(Name), "Lead name must contain 2 to 150 characters.");
        }

        var normalizedEmail = EmailAddress.Create(email);

        if (actorUserId == Guid.Empty)
        {
            throw new DomainValidationException(nameof(actorUserId), "Actor id is required.");
        }

        Name = normalizedName;
        Email = normalizedEmail;
        Phone = NormalizeOptional(phone, 25, nameof(phone));
        Source = NormalizeOptional(source, 80, nameof(source));
        RecordUpdate(actorUserId);
    }

    public bool TryTransitionTo(LeadStatus target, Guid actorUserId)
    {
        var allowed = Status switch
        {
            LeadStatus.New => target is LeadStatus.Contacted or LeadStatus.Lost,
            LeadStatus.Contacted => target is LeadStatus.Qualified or LeadStatus.Lost,
            LeadStatus.Qualified => target is LeadStatus.Proposal or LeadStatus.Lost,
            LeadStatus.Proposal => target is LeadStatus.Negotiation or LeadStatus.Lost,
            LeadStatus.Negotiation => target is LeadStatus.Converted or LeadStatus.Lost,
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

    private static string? NormalizeOptional(string? value, int maxLength, string parameterName)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var normalized = value.Trim();
        if (normalized.Length > maxLength)
        {
            throw new DomainValidationException(parameterName, $"Value cannot exceed {maxLength} characters.");
        }

        return normalized;
    }
}
