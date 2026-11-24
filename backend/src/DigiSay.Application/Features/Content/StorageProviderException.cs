namespace DigiSay.Application.Features.Content;

public sealed class StorageProviderException(string message, int? statusCode = null, Exception? innerException = null)
    : Exception(message, innerException)
{
    public int? StatusCode { get; } = statusCode;
}
