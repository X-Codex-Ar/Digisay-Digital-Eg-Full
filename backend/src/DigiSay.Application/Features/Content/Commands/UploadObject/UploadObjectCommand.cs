namespace DigiSay.Application.Features.Content.Commands.UploadObject;

public sealed record UploadObjectCommand(Guid OrganizationId, Stream Content, long DeclaredSizeBytes);
