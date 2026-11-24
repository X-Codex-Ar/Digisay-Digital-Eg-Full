using DigiSay.Domain.Entities;

namespace DigiSay.Application.Features.ContactInquiries;

public sealed class CreateContactInquiryHandler(IContactInquiryWriter inquiryWriter)
{
    public async Task<ContactInquiry> HandleAsync(
        CreateContactInquiryCommand command,
        string? sourceIp,
        CancellationToken cancellationToken)
    {
        var inquiry = ContactInquiry.Create(
            command.FirstName,
            command.LastName,
            command.Email,
            command.Phone,
            command.Service,
            command.Message,
            sourceIp);

        await inquiryWriter.SaveAsync(inquiry, cancellationToken);
        return inquiry;
    }
}

public sealed record CreateContactInquiryCommand(
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    string Service,
    string? Message);
