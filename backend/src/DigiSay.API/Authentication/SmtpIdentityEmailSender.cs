using System.Net;
using System.Net.Mail;
using DigiSay.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace DigiSay.API.Authentication;

internal sealed class SmtpIdentityEmailSender(IOptions<SmtpEmailOptions> emailOptions)
    : IEmailSender<DigiSayUser>
{
    public Task SendConfirmationLinkAsync(DigiSayUser user, string email, string confirmationLink) =>
        SendAsync(email, "Confirm your DigiSay account", $"Confirm your email address: {WebUtility.HtmlDecode(confirmationLink)}");

    public Task SendPasswordResetLinkAsync(DigiSayUser user, string email, string resetLink) =>
        SendAsync(email, "Reset your DigiSay password", $"Reset your password: {WebUtility.HtmlDecode(resetLink)}");

    public Task SendPasswordResetCodeAsync(DigiSayUser user, string email, string resetCode) =>
        SendAsync(email, "Reset your DigiSay password", $"Your password reset code is: {resetCode}");

    private async Task SendAsync(string recipient, string subject, string body)
    {
        var options = emailOptions.Value;
        using var message = new MailMessage(options.FromAddress, recipient, subject, body);
        using var client = new SmtpClient(options.Host, options.Port)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(options.UserName, options.Password),
            DeliveryMethod = SmtpDeliveryMethod.Network,
            Timeout = 15_000,
        };

        await client.SendMailAsync(message);
    }
}
