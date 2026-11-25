using DigiSay.Application.Features.Content;
using DigiSay.Application.Features.Content.Abstractions;
using DigiSay.Application.Features.Content.Commands.DeleteObject;
using DigiSay.Application.Features.Content.Commands.UploadObject;
using DigiSay.Application.Features.Content.Queries.CreateDownloadLink;
using DigiSay.Application.Features.Content.Queries.GetObject;
using DigiSay.Domain.Entities.Content;
using Xunit;

namespace DigiSay.Application.Tests;

public sealed class ContentStorageUseCaseTests
{
    [Fact]
    public async Task Upload_detects_type_from_file_signature_and_binds_path_to_organization()
    {
        var storage = new FakePrivateObjectStorage();
        var objects = new FakeStorageObjectStore();
        var organizationId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var bytes = new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 1, 2 };

        var stored = await new UploadObjectHandler(storage, objects).HandleAsync(
            new UploadObjectCommand(organizationId, userId, new MemoryStream(bytes), bytes.Length), CancellationToken.None);

        Assert.Equal("image/png", stored.ContentType);
        Assert.Equal(bytes.Length, stored.SizeBytes);
        Assert.Equal(organizationId, storage.UploadedOrganizationId);
        Assert.Equal(stored.Id, storage.UploadedObjectId);
        Assert.Equal("image/png", storage.UploadedContentType);
        Assert.Equal(bytes, storage.UploadedBytes);
        var record = Assert.Single(objects.Records);
        Assert.Equal(stored.Id, record.Id);
        Assert.Equal(organizationId, record.OrganizationId);
        Assert.Equal(userId, record.CreatedByUserId);
        Assert.Equal("image/png", record.ContentType);
        Assert.Equal(bytes.Length, record.SizeBytes);
    }

    [Fact]
    public async Task Upload_removes_the_provider_object_when_metadata_cannot_be_saved()
    {
        var storage = new FakePrivateObjectStorage();
        var objects = new FakeStorageObjectStore { FailAdd = true };
        var bytes = new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 1 };

        await Assert.ThrowsAsync<InvalidOperationException>(() => new UploadObjectHandler(storage, objects).HandleAsync(
            new UploadObjectCommand(Guid.NewGuid(), Guid.NewGuid(), new MemoryStream(bytes), bytes.Length), CancellationToken.None));

        Assert.Equal(storage.UploadedObjectId, storage.LastObjectId);
        Assert.NotNull(storage.DeletedOrganizationId);
        Assert.Empty(objects.Records);
    }

    [Fact]
    public async Task Metadata_download_and_delete_return_not_found_without_provider_calls_for_unknown_or_cross_tenant_objects()
    {
        var storage = new FakePrivateObjectStorage();
        var objects = new FakeStorageObjectStore();
        var owner = Guid.NewGuid();
        var record = StorageObjectRecord.Create(Guid.NewGuid(), owner, Guid.NewGuid(), "application/pdf", 10, DateTimeOffset.UtcNow);
        objects.Records.Add(record);
        var other = Guid.NewGuid();

        var found = await new GetObjectHandler(objects).HandleAsync(new GetObjectQuery(owner, record.Id), CancellationToken.None);
        Assert.Equal(record.Id, found.Id);
        await Assert.ThrowsAsync<StorageObjectNotFoundException>(() => new GetObjectHandler(objects).HandleAsync(
            new GetObjectQuery(other, record.Id), CancellationToken.None));
        await Assert.ThrowsAsync<StorageObjectNotFoundException>(() => new CreateDownloadLinkHandler(storage, objects).HandleAsync(
            new CreateDownloadLinkQuery(other, record.Id), CancellationToken.None));
        await Assert.ThrowsAsync<StorageObjectNotFoundException>(() => new DeleteObjectHandler(storage, objects).HandleAsync(
            new DeleteObjectCommand(other, record.Id), CancellationToken.None));

        Assert.Null(storage.LastOrganizationId);
        Assert.Null(storage.DeletedOrganizationId);
        Assert.Single(objects.Records);
    }

    [Fact]
    public async Task Upload_rejects_fake_mime_signatures_size_mismatch_and_oversized_files()
    {
        var handler = new UploadObjectHandler(new FakePrivateObjectStorage(), new FakeStorageObjectStore());
        var organizationId = Guid.NewGuid();

        await Assert.ThrowsAsync<StorageValidationException>(() => handler.HandleAsync(
            new UploadObjectCommand(organizationId, Guid.NewGuid(), new MemoryStream("not a PDF"u8.ToArray()), 9), CancellationToken.None));
        await Assert.ThrowsAsync<StorageValidationException>(() => handler.HandleAsync(
            new UploadObjectCommand(organizationId, Guid.NewGuid(), new MemoryStream("%PDF-1.7"u8.ToArray()), 99), CancellationToken.None));
        await Assert.ThrowsAsync<StorageValidationException>(() => handler.HandleAsync(
            new UploadObjectCommand(organizationId, Guid.NewGuid(), Stream.Null, UploadObjectHandler.MaximumFileSizeBytes + 1L), CancellationToken.None));
    }

    [Fact]
    public async Task Download_link_has_a_fixed_short_expiry_and_delete_uses_current_tenant_scope()
    {
        var storage = new FakePrivateObjectStorage();
        var organizationId = Guid.NewGuid();
        var objects = new FakeStorageObjectStore();
        var objectId = Guid.NewGuid();
        objects.Records.Add(StorageObjectRecord.Create(objectId, organizationId, Guid.NewGuid(), "application/pdf", 10, DateTimeOffset.UtcNow));
        var before = DateTimeOffset.UtcNow;

        var link = await new CreateDownloadLinkHandler(storage, objects).HandleAsync(
            new CreateDownloadLinkQuery(organizationId, objectId), CancellationToken.None);
        await new DeleteObjectHandler(storage, objects).HandleAsync(
            new DeleteObjectCommand(organizationId, objectId), CancellationToken.None);

        Assert.Equal(CreateDownloadLinkHandler.LinkLifetime, storage.RequestedExpiry);
        Assert.InRange(link.ExpiresAtUtc, before.AddMinutes(5), DateTimeOffset.UtcNow.AddMinutes(5));
        Assert.True(link.ExpiresAtUtc <= storage.SignStartedAtUtc + CreateDownloadLinkHandler.LinkLifetime);
        Assert.Equal(organizationId, storage.LastOrganizationId);
        Assert.Equal(objectId, storage.LastObjectId);
        Assert.Equal(organizationId, storage.DeletedOrganizationId);
        Assert.Empty(objects.Records);
    }

    [Fact]
    public async Task Upload_reports_the_original_persistence_error_even_when_cleanup_also_fails_and_this_is_not_atomic()
    {
        var storage = new FakePrivateObjectStorage { DeleteFailure = new StorageProviderException("down", 503) };
        var objects = new FakeStorageObjectStore { FailAdd = true };
        var bytes = new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 1 };

        var error = await Assert.ThrowsAsync<InvalidOperationException>(() => new UploadObjectHandler(storage, objects).HandleAsync(
            new UploadObjectCommand(Guid.NewGuid(), Guid.NewGuid(), new MemoryStream(bytes), bytes.Length), CancellationToken.None));

        Assert.Equal("database unavailable", error.Message);
        Assert.NotNull(storage.UploadedObjectId);
        Assert.Empty(objects.Records);
    }

    [Fact]
    public async Task Delete_keeps_metadata_when_the_provider_fails_and_removes_it_when_the_provider_object_is_already_gone()
    {
        var organizationId = Guid.NewGuid();
        var record = StorageObjectRecord.Create(Guid.NewGuid(), organizationId, Guid.NewGuid(), "application/pdf", 10, DateTimeOffset.UtcNow);
        var objects = new FakeStorageObjectStore();
        objects.Records.Add(record);
        var storage = new FakePrivateObjectStorage { DeleteFailure = new StorageProviderException("down", 503) };
        var handler = new DeleteObjectHandler(storage, objects);

        await Assert.ThrowsAsync<StorageProviderException>(() => handler.HandleAsync(
            new DeleteObjectCommand(organizationId, record.Id), CancellationToken.None));
        Assert.Single(objects.Records);

        storage.DeleteFailure = new StorageProviderException("gone", 404);
        await handler.HandleAsync(new DeleteObjectCommand(organizationId, record.Id), CancellationToken.None);
        Assert.Empty(objects.Records);
    }

    private sealed class FakeStorageObjectStore : IStorageObjectStore
    {
        public List<StorageObjectRecord> Records { get; } = [];
        public bool FailAdd { get; init; }

        public Task AddAsync(StorageObjectRecord record, CancellationToken cancellationToken)
        {
            if (FailAdd)
            {
                throw new InvalidOperationException("database unavailable");
            }

            Records.Add(record);
            return Task.CompletedTask;
        }

        public Task<StorageObjectRecord?> FindAsync(Guid organizationId, Guid objectId, CancellationToken cancellationToken) =>
            Task.FromResult(Records.SingleOrDefault(item => item.OrganizationId == organizationId && item.Id == objectId));

        public Task RemoveAsync(Guid organizationId, Guid objectId, CancellationToken cancellationToken)
        {
            Records.RemoveAll(item => item.OrganizationId == organizationId && item.Id == objectId);
            return Task.CompletedTask;
        }
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
        public StorageProviderException? DeleteFailure { get; set; }

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
            return DeleteFailure is null ? Task.CompletedTask : Task.FromException(DeleteFailure);
        }
    }
}
