namespace DigiSay.Application.Features.Content.Commands.UploadObject;

public sealed record UploadObjectCommand(Guid OrganizationId, Guid UserId, Stream Content, long DeclaredSizeBytes);
