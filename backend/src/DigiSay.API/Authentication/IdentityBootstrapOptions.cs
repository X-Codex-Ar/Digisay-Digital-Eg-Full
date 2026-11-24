namespace DigiSay.API.Authentication;

internal sealed class IdentityBootstrapOptions
{
    public const string SectionName = "Identity";
    public string BootstrapAdminSecret { get; set; } = string.Empty;
}
