using DigiSay.Domain.Entities.Content;

namespace DigiSay.Application.Features.Content.Abstractions;

public interface IStorageObjectStore
{
    Task AddAsync(StorageObjectRecord record, CancellationToken cancellationToken);
    Task<StorageObjectRecord?> FindAsync(Guid organizationId, Guid objectId, CancellationToken cancellationToken);
    Task RemoveAsync(Guid organizationId, Guid objectId, CancellationToken cancellationToken);
}
