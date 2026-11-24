using DigiSay.Domain.Entities;
using Xunit;

namespace DigiSay.Domain.Tests;

public sealed class ContactInquiryTests
{
    [Fact]
    public void Create_trims_text_and_normalizes_optional_values()
    {
        var before = DateTimeOffset.UtcNow;

        var inquiry = ContactInquiry.Create(
            "  Ada ", " Lovelace  ", " ada@example.com ", "  +1 555 0100 ",
            " Strategy ", "  Please contact me.  ", "127.0.0.1");

        var after = DateTimeOffset.UtcNow;
        Assert.Equal("Ada", inquiry.FirstName);
        Assert.Equal("Lovelace", inquiry.LastName);
        Assert.Equal("ada@example.com", inquiry.Email);
        Assert.Equal("+1 555 0100", inquiry.Phone);
        Assert.Equal("Strategy", inquiry.Service);
        Assert.Equal("Please contact me.", inquiry.Message);
        Assert.Equal("127.0.0.1", inquiry.SourceIp);
        Assert.InRange(inquiry.CreatedAtUtc, before, after);
        Assert.NotEqual(Guid.Empty, inquiry.Id);
    }

    [Fact]
    public void Create_converts_blank_optional_values_to_null()
    {
        var inquiry = ContactInquiry.Create(
            "Ada", "Lovelace", "ada@example.com", " ", "Strategy", "", null);

        Assert.Null(inquiry.Phone);
        Assert.Null(inquiry.Message);
        Assert.Null(inquiry.SourceIp);
    }
}
