using DigiSay.Application.ContactInquiries;
using DigiSay.Domain;

namespace DigiSay.Infrastructure.Persistence;

internal sealed class SqlContactInquiryWriter(DigiSayDbContext dbContext) : IContactInquiryWriter
{
    public async Task SaveAsync(ContactInquiry inquiry, CancellationToken cancellationToken)
    {
        dbContext.ContactInquiries.Add(inquiry);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
