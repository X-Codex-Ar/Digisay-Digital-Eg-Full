namespace DigiSay.Infrastructure.Storage.Supabase;

public sealed class SupabaseStorageOptions
{
    public const string SectionName = "Storage:Supabase";

    public string ProjectUrl { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string PrivateBucket { get; set; } = "digisay-private";
}
