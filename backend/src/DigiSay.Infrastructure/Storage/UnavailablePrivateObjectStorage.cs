using DigiSay.Application.Features.Content;
using DigiSay.Application.Features.Content.Abstractions;

namespace DigiSay.Infrastructure.Storage;

internal sealed class UnavailablePrivateObjectStorage : IPrivateObjectStorage
{
    private static StorageProviderException Unavailable() =>
        new("Private storage is not configured for this development environment.", 503);

    public Task<IReadOnlyList<StorageObject>> ListAsync(Guid organizationId, CancellationToken cancellationToken) =>
        Task.FromException<IReadOnlyList<StorageObject>>(Unavailable());

    public Task UploadAsync(
        Guid organizationId,
        Guid objectId,
        Stream content,
        string verifiedContentType,
        CancellationToken cancellationToken) =>
        Task.FromException(Unavailable());

    public Task<Uri> CreateSignedDownloadUrlAsync(
        Guid organizationId,
        Guid objectId,
        TimeSpan expiresIn,
        CancellationToken cancellationToken) =>
        Task.FromException<Uri>(Unavailable());

    public Task DeleteAsync(Guid organizationId, Guid objectId, CancellationToken cancellationToken) =>
        Task.FromException(Unavailable());
}

