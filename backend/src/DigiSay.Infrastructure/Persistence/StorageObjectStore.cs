using DigiSay.Application.Features.Content.Abstractions;
using DigiSay.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;

namespace DigiSay.Infrastructure.Persistence;

internal sealed class StorageObjectStore(DigiSayDbContext dbContext) : IStorageObjectStore
{
    public async Task AddAsync(StorageObjectRecord record, CancellationToken cancellationToken)
    {
        dbContext.StorageObjects.Add(record);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public Task<StorageObjectRecord?> FindAsync(Guid organizationId, Guid objectId, CancellationToken cancellationToken) =>
        dbContext.StorageObjects
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.OrganizationId == organizationId && item.Id == objectId, cancellationToken);

    public async Task RemoveAsync(Guid organizationId, Guid objectId, CancellationToken cancellationToken) =>
        await dbContext.StorageObjects
            .Where(item => item.OrganizationId == organizationId && item.Id == objectId)
            .ExecuteDeleteAsync(cancellationToken);
}
