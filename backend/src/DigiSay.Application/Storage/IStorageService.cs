namespace DigiSay.Application.Storage;

/// <summary>
/// Abstraction for media storage operations across local and Supabase Storage providers.
/// </summary>
public interface IStorageService
{
    /// <summary>
    /// Resolves the public CDN URL for an object stored in a public bucket.
    /// </summary>
    string GetPublicUrl(string bucket, string path);

    /// <summary>
    /// Generates a time-limited signed URL for accessing private objects.
    /// </summary>
    Task<string> GetSignedUrlAsync(string bucket, string path, TimeSpan expiresIn, CancellationToken cancellationToken = default);

    /// <summary>
    /// Uploads a binary media stream to the specified bucket.
    /// </summary>
    Task<string> UploadAsync(string bucket, string path, Stream content, string contentType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Removes an object from storage.
    /// </summary>
    Task DeleteAsync(string bucket, string path, CancellationToken cancellationToken = default);
}
