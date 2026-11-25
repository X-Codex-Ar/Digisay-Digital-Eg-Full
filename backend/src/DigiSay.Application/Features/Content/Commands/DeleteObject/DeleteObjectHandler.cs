using DigiSay.Application.Features.Content.Abstractions;

namespace DigiSay.Application.Features.Content.Commands.DeleteObject;

public sealed class DeleteObjectHandler(IPrivateObjectStorage storage, IStorageObjectStore objects)
{
    public async Task HandleAsync(DeleteObjectCommand command, CancellationToken cancellationToken)
    {
        if (command.OrganizationId == Guid.Empty || command.ObjectId == Guid.Empty)
        {
            throw new StorageValidationException("A valid organization and object identifier are required.");
        }

        _ = await objects.FindAsync(command.OrganizationId, command.ObjectId, cancellationToken)
            ?? throw new StorageObjectNotFoundException();

        try
        {
            await storage.DeleteAsync(command.OrganizationId, command.ObjectId, cancellationToken);
        }
        catch (StorageProviderException exception) when (exception.StatusCode == 404)
        {
            // The provider object is already gone; remove the stale metadata below.
        }

        await objects.RemoveAsync(command.OrganizationId, command.ObjectId, cancellationToken);
    }
}
