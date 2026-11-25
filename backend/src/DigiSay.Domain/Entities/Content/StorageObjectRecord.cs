using DigiSay.Domain.Exceptions;

namespace DigiSay.Domain.Entities.Content;

public sealed class StorageObjectRecord
{
    private StorageObjectRecord() { }

    public Guid Id { get; private set; }
    public Guid OrganizationId { get; private set; }
    public Guid CreatedByUserId { get; private set; }
    public string ContentType { get; private set; } = string.Empty;
    public long SizeBytes { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }

    public static StorageObjectRecord Create(Guid id, Guid organizationId, Guid createdByUserId, string contentType, long sizeBytes, DateTimeOffset createdAtUtc)
    {
        if (id == Guid.Empty)
        {
            throw new DomainValidationException(nameof(id), "Object id is required.");
        }

        if (organizationId == Guid.Empty)
        {
            throw new DomainValidationException(nameof(organizationId), "Organization id is required.");
        }

        if (createdByUserId == Guid.Empty)
        {
            throw new DomainValidationException(nameof(createdByUserId), "Creator user id is required.");
        }

        if (string.IsNullOrWhiteSpace(contentType))
        {
            throw new DomainValidationException(nameof(contentType), "Content type is required.");
        }

        if (sizeBytes <= 0)
        {
            throw new DomainValidationException(nameof(sizeBytes), "Size must be greater than zero.");
        }

        return new StorageObjectRecord
        {
            Id = id,
            OrganizationId = organizationId,
            CreatedByUserId = createdByUserId,
            ContentType = contentType,
            SizeBytes = sizeBytes,
            CreatedAtUtc = createdAtUtc,
        };
    }
}
