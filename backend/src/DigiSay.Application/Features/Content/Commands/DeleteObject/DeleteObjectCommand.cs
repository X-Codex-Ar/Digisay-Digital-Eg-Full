namespace DigiSay.Application.Features.Content.Commands.DeleteObject;

public sealed record DeleteObjectCommand(Guid OrganizationId, Guid ObjectId);
