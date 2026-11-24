namespace DigiSay.API.RateLimiting;

internal sealed class RateLimitKeyOptions
{
    public const string SectionName = "RateLimiting";
    public string KeyHashSecret { get; set; } = string.Empty;
}
