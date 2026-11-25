using DigiSay.Application.Features.Content.Abstractions;

namespace DigiSay.Application.Features.Content.Queries.ListObjects;

public sealed class ListObjectsHandler(IPrivateObjectStorage storage)
{
    public Task<IReadOnlyList<StorageObject>> HandleAsync(Guid organizationId, CancellationToken cancellationToken)
    {
        if (organizationId == Guid.Empty)
        {
            throw new StorageValidationException("A verified organization is required.");
        }

        return storage.ListAsync(organizationId, cancellationToken);
    }
}
