namespace DigiSay.API.RateLimiting;

internal sealed record RateLimitPolicy(string Name, int PermitLimit, TimeSpan Window);
