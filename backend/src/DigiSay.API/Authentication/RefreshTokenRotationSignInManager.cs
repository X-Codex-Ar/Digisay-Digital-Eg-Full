using System.Security.Claims;
using DigiSay.Infrastructure.Identity;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace DigiSay.API.Authentication;

internal sealed class RefreshTokenRotationSignInManager(
    UserManager<DigiSayUser> userManager,
    IHttpContextAccessor contextAccessor,
    IUserClaimsPrincipalFactory<DigiSayUser> claimsFactory,
    IOptions<IdentityOptions> optionsAccessor,
    ILogger<SignInManager<DigiSayUser>> logger,
    IAuthenticationSchemeProvider schemes,
    IUserConfirmation<DigiSayUser> confirmation)
    : SignInManager<DigiSayUser>(userManager, contextAccessor, claimsFactory, optionsAccessor, logger, schemes, confirmation)
{
    public override async Task<DigiSayUser?> ValidateSecurityStampAsync(ClaimsPrincipal? principal)
    {
        var user = await base.ValidateSecurityStampAsync(principal);
        var path = Context?.Request.Path.Value?.TrimEnd('/');
        if (user is null || path is null || !path.EndsWith("/auth/refresh", StringComparison.OrdinalIgnoreCase))
        {
            return user;
        }

        // Identity's built-in refresh token is protected and expiring, but reusable until expiry.
        // Rotate the account security stamp on successful refresh so the prior token cannot be replayed.
        var result = await UserManager.UpdateSecurityStampAsync(user);
        return result.Succeeded ? user : null;
    }
}
