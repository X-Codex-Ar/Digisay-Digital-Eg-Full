using DigiSay.Domain;

namespace DigiSay.Application.ContactInquiries;

public interface IContactInquiryWriter
{
    Task SaveAsync(ContactInquiry inquiry, CancellationToken cancellationToken);
}
