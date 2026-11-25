using DigiSay.Application.Features.Content.Abstractions;

namespace DigiSay.Application.Features.Content.Queries.GetObject;

public sealed record GetObjectQuery(Guid OrganizationId, Guid ObjectId);

public sealed class GetObjectHandler(IStorageObjectStore objects)
{
    public async Task<StorageObject> HandleAsync(GetObjectQuery query, CancellationToken cancellationToken)
    {
        if (query.OrganizationId == Guid.Empty || query.ObjectId == Guid.Empty)
        {
            throw new StorageValidationException("A valid organization and object identifier are required.");
        }

        var record = await objects.FindAsync(query.OrganizationId, query.ObjectId, cancellationToken)
            ?? throw new StorageObjectNotFoundException();
        return new StorageObject(record.Id, record.ContentType, record.SizeBytes, record.CreatedAtUtc);
    }
}
