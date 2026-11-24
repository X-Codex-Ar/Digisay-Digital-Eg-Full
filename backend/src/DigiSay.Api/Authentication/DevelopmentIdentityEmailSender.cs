using DigiSay.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;

namespace DigiSay.Api.Authentication;

internal sealed class DevelopmentIdentityEmailSender(ILogger<DevelopmentIdentityEmailSender> logger)
    : IEmailSender<DigiSayUser>
{
    public Task SendConfirmationLinkAsync(DigiSayUser user, string email, string confirmationLink)
    {
        logger.LogInformation("Development-only account confirmation link for {Email}: {Link}", email, confirmationLink);
        return Task.CompletedTask;
    }

    public Task SendPasswordResetLinkAsync(DigiSayUser user, string email, string resetLink)
    {
        logger.LogInformation("Development-only password reset link for {Email}: {Link}", email, resetLink);
        return Task.CompletedTask;
    }

    public Task SendPasswordResetCodeAsync(DigiSayUser user, string email, string resetCode)
    {
        logger.LogInformation("Development-only password reset code for {Email}: {Code}", email, resetCode);
        return Task.CompletedTask;
    }
}
