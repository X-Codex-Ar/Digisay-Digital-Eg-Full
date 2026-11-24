using DigiSay.Application.Features.ContactInquiries;
using DigiSay.Domain.Entities;

namespace DigiSay.Infrastructure.Persistence;

internal sealed class SqlContactInquiryWriter(DigiSayDbContext dbContext) : IContactInquiryWriter
{
    public async Task SaveAsync(ContactInquiry inquiry, CancellationToken cancellationToken)
    {
        dbContext.ContactInquiries.Add(inquiry);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
