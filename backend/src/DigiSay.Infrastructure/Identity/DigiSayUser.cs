using Microsoft.AspNetCore.Identity;

namespace DigiSay.Infrastructure.Identity;

public sealed class DigiSayUser : IdentityUser<Guid>
{
    public string? DisplayName { get; set; }
}
