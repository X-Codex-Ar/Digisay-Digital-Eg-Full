using DigiSay.Application.Features.Content;
using DigiSay.Application.Features.Content.Abstractions;
using DigiSay.Application.Features.Content.Commands.DeleteObject;
using DigiSay.Application.Features.Content.Commands.UploadObject;
using DigiSay.Application.Features.Content.Queries.CreateDownloadLink;
using Xunit;

namespace DigiSay.Application.Tests;

public sealed class ContentStorageUseCaseTests
{
    [Fact]
    public async Task Upload_detects_type_from_file_signature_and_binds_path_to_organization()
    {
        var storage = new FakePrivateObjectStorage();
        var organizationId = Guid.NewGuid();
        var bytes = new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 1, 2 };

        var stored = await new UploadObjectHandler(storage).HandleAsync(
            new UploadObjectCommand(organizationId, new MemoryStream(bytes), bytes.Length), CancellationToken.None);

        Assert.Equal("image/png", stored.ContentType);
        Assert.Equal(bytes.Length, stored.SizeBytes);
        Assert.Equal(organizationId, storage.UploadedOrganizationId);
        Assert.Equal(stored.Id, storage.UploadedObjectId);
        Assert.Equal("image/png", storage.UploadedContentType);
        Assert.Equal(bytes, storage.UploadedBytes);
    }

    [Fact]
    public async Task Upload_rejects_fake_mime_signatures_size_mismatch_and_oversized_files()
    {
        var handler = new UploadObjectHandler(new FakePrivateObjectStorage());
        var organizationId = Guid.NewGuid();

        await Assert.ThrowsAsync<StorageValidationException>(() => handler.HandleAsync(
            new UploadObjectCommand(organizationId, new MemoryStream("not a PDF"u8.ToArray()), 9), CancellationToken.None));
        await Assert.ThrowsAsync<StorageValidationException>(() => handler.HandleAsync(
            new UploadObjectCommand(organizationId, new MemoryStream("%PDF-1.7"u8.ToArray()), 99), CancellationToken.None));
        await Assert.ThrowsAsync<StorageValidationException>(() => handler.HandleAsync(
            new UploadObjectCommand(organizationId, Stream.Null, UploadObjectHandler.MaximumFileSizeBytes + 1L), CancellationToken.None));
    }

    [Fact]
    public async Task Download_link_has_a_fixed_short_expiry_and_delete_uses_current_tenant_scope()
    {
        var storage = new FakePrivateObjectStorage();
        var organizationId = Guid.NewGuid();
        var objectId = Guid.NewGuid();
        var before = DateTimeOffset.UtcNow;

        var link = await new CreateDownloadLinkHandler(storage).HandleAsync(
            new CreateDownloadLinkQuery(organizationId, objectId), CancellationToken.None);
        await new DeleteObjectHandler(storage).HandleAsync(
            new DeleteObjectCommand(organizationId, objectId), CancellationToken.None);

        Assert.Equal(CreateDownloadLinkHandler.LinkLifetime, storage.RequestedExpiry);
        Assert.InRange(link.ExpiresAtUtc, before.AddMinutes(5), DateTimeOffset.UtcNow.AddMinutes(5));
        Assert.True(link.ExpiresAtUtc <= storage.SignStartedAtUtc + CreateDownloadLinkHandler.LinkLifetime);
        Assert.Equal(organizationId, storage.LastOrganizationId);
        Assert.Equal(objectId, storage.LastObjectId);
        Assert.Equal(organizationId, storage.DeletedOrganizationId);
    }

    private sealed class FakePrivateObjectStorage : IPrivateObjectStorage
    {
        public Guid? UploadedOrganizationId { get; private set; }
        public Guid? UploadedObjectId { get; private set; }
        public string? UploadedContentType { get; private set; }
        public byte[]? UploadedBytes { get; private set; }
        public Guid? LastOrganizationId { get; private set; }
        public Guid? LastObjectId { get; private set; }
        public Guid? DeletedOrganizationId { get; private set; }
        public TimeSpan? RequestedExpiry { get; private set; }
        public DateTimeOffset SignStartedAtUtc { get; private set; }

        public Task<IReadOnlyList<StorageObject>> ListAsync(Guid organizationId, CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<StorageObject>>([]);

        public async Task UploadAsync(Guid organizationId, Guid objectId, Stream content, string verifiedContentType, CancellationToken cancellationToken)
        {
            UploadedOrganizationId = organizationId;
            UploadedObjectId = objectId;
            UploadedContentType = verifiedContentType;
            using var buffer = new MemoryStream();
            await content.CopyToAsync(buffer, cancellationToken);
            UploadedBytes = buffer.ToArray();
        }

        public async Task<Uri> CreateSignedDownloadUrlAsync(Guid organizationId, Guid objectId, TimeSpan expiresIn, CancellationToken cancellationToken)
        {
            LastOrganizationId = organizationId;
            LastObjectId = objectId;
            RequestedExpiry = expiresIn;
            SignStartedAtUtc = DateTimeOffset.UtcNow;
            await Task.Delay(TimeSpan.FromMilliseconds(100), cancellationToken);
            return new Uri("https://storage.example.test/private-object?token=test");
        }

        public Task DeleteAsync(Guid organizationId, Guid objectId, CancellationToken cancellationToken)
        {
            DeletedOrganizationId = organizationId;
            LastObjectId = objectId;
            return Task.CompletedTask;
        }
    }
}
