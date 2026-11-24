namespace DigiSay.Application.Features.Content;

public sealed record StorageObject(Guid Id, string ContentType, long SizeBytes, DateTimeOffset CreatedAtUtc);

public sealed record StorageDownloadLink(Guid ObjectId, Uri Url, DateTimeOffset ExpiresAtUtc);
