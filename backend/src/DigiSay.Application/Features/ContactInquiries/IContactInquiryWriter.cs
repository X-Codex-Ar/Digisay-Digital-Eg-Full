using DigiSay.Domain.Entities;

namespace DigiSay.Application.Features.ContactInquiries;

public interface IContactInquiryWriter
{
    Task SaveAsync(ContactInquiry inquiry, CancellationToken cancellationToken);
}
