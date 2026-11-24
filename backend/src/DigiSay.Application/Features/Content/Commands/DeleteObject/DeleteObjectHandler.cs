using DigiSay.Application.Features.Content.Abstractions;

namespace DigiSay.Application.Features.Content.Commands.DeleteObject;

public sealed class DeleteObjectHandler(IPrivateObjectStorage storage)
{
    public Task HandleAsync(DeleteObjectCommand command, CancellationToken cancellationToken)
    {
        if (command.OrganizationId == Guid.Empty || command.ObjectId == Guid.Empty)
        {
            throw new StorageValidationException("A valid organization and object identifier are required.");
        }

        return storage.DeleteAsync(command.OrganizationId, command.ObjectId, cancellationToken);
    }
}
