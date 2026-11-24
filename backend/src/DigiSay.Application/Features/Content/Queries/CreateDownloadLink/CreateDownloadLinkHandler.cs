using DigiSay.Application.Features.Content.Abstractions;

namespace DigiSay.Application.Features.Content.Queries.CreateDownloadLink;

public sealed class CreateDownloadLinkHandler(IPrivateObjectStorage storage)
{
    public static readonly TimeSpan LinkLifetime = TimeSpan.FromMinutes(5);

    public async Task<StorageDownloadLink> HandleAsync(CreateDownloadLinkQuery query, CancellationToken cancellationToken)
    {
        if (query.OrganizationId == Guid.Empty || query.ObjectId == Guid.Empty)
        {
            throw new StorageValidationException("A valid organization and object identifier are required.");
        }

        var expiresAtUtc = DateTimeOffset.UtcNow.Add(LinkLifetime);
        var url = await storage.CreateSignedDownloadUrlAsync(
            query.OrganizationId, query.ObjectId, LinkLifetime, cancellationToken);
        return new StorageDownloadLink(query.ObjectId, url, expiresAtUtc);
    }
}
