namespace DigiSay.Application.Features.Content.Abstractions;

public interface IPrivateObjectStorage
{
    Task<IReadOnlyList<StorageObject>> ListAsync(Guid organizationId, CancellationToken cancellationToken);

    Task UploadAsync(
        Guid organizationId,
        Guid objectId,
        Stream content,
        string verifiedContentType,
        CancellationToken cancellationToken);

    Task<Uri> CreateSignedDownloadUrlAsync(
        Guid organizationId,
        Guid objectId,
        TimeSpan expiresIn,
        CancellationToken cancellationToken);

    Task DeleteAsync(Guid organizationId, Guid objectId, CancellationToken cancellationToken);
}
