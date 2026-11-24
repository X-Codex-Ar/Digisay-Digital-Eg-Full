using DigiSay.Application.Features.Content.Abstractions;

namespace DigiSay.Application.Features.Content.Commands.UploadObject;

public sealed class UploadObjectHandler(IPrivateObjectStorage storage)
{
    public const int MaximumFileSizeBytes = 10 * 1024 * 1024;
    private const int SignatureLength = 8;

    public async Task<StorageObject> HandleAsync(UploadObjectCommand command, CancellationToken cancellationToken)
    {
        if (command.OrganizationId == Guid.Empty)
        {
            throw new StorageValidationException("A verified organization is required.");
        }

        if (command.DeclaredSizeBytes <= 0 || command.DeclaredSizeBytes > MaximumFileSizeBytes)
        {
            throw new StorageValidationException($"File size must be between 1 and {MaximumFileSizeBytes} bytes.");
        }

        await using var content = new MemoryStream(capacity: (int)command.DeclaredSizeBytes);
        var buffer = new byte[81920];
        int read;
        while ((read = await command.Content.ReadAsync(buffer, cancellationToken)) > 0)
        {
            if (content.Length + read > MaximumFileSizeBytes)
            {
                throw new StorageValidationException($"File size cannot exceed {MaximumFileSizeBytes} bytes.");
            }

            await content.WriteAsync(buffer.AsMemory(0, read), cancellationToken);
        }

        if (content.Length != command.DeclaredSizeBytes)
        {
            throw new StorageValidationException("The received file size does not match the upload metadata.");
        }

        var contentType = DetectContentType(content.GetBuffer().AsSpan(0, Math.Min((int)content.Length, SignatureLength)));
        if (contentType is null)
        {
            throw new StorageValidationException("Only PDF, JPEG, and PNG files are allowed.");
        }

        var objectId = Guid.NewGuid();
        content.Position = 0;
        await storage.UploadAsync(command.OrganizationId, objectId, content, contentType, cancellationToken);

        return new StorageObject(objectId, contentType, content.Length, DateTimeOffset.UtcNow);
    }

    private static string? DetectContentType(ReadOnlySpan<byte> header)
    {
        if (header.Length >= 5 && header[..5].SequenceEqual("%PDF-"u8)) return "application/pdf";
        if (header.Length >= 3 && header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF) return "image/jpeg";
        if (header.Length >= 8 && header.SequenceEqual(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A })) return "image/png";
        return null;
    }
}
