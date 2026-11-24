using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace DigiSay.Api.IntegrationTests;

public sealed class ContactInquiryApiTests
{
    [Fact]
    public async Task Health_endpoint_reports_liveness()
    {
        using var factory = new DigiSayApiFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/v1/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Development_openapi_document_contains_contact_endpoint()
    {
        using var factory = new DigiSayApiFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/openapi/v1.json");
        var document = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("/api/v{version}/contact-inquiries", document, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Valid_contact_inquiry_is_saved_and_returns_created()
    {
        using var factory = new DigiSayApiFactory();
        using var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/v1/contact-inquiries", ValidRequest());

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var inquiry = Assert.Single(factory.Writer.Saved);
        Assert.Equal("Ada", inquiry.FirstName);
        Assert.Equal("Lovelace", inquiry.LastName);
        Assert.Equal("ada@example.com", inquiry.Email);
    }

    [Fact]
    public async Task Invalid_contact_inquiry_returns_problem_details_without_saving()
    {
        using var factory = new DigiSayApiFactory();
        using var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/v1/contact-inquiries", new
        {
            firstName = "Ada",
            lastName = "Lovelace",
            email = "not-an-email",
            service = "Strategy",
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Empty(factory.Writer.Saved);
    }

    [Fact]
    public async Task Honeypot_submission_is_accepted_without_saving()
    {
        using var factory = new DigiSayApiFactory();
        using var client = factory.CreateClient();
        var request = new
        {
            firstName = "Ada",
            lastName = "Lovelace",
            email = "ada@example.com",
            service = "Strategy",
            botField = "filled-by-a-bot",
        };

        var response = await client.PostAsJsonAsync("/api/v1/contact-inquiries", request);

        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
        Assert.Empty(factory.Writer.Saved);
    }

    [Fact]
    public async Task Contact_rate_limit_rejects_request_after_five_submissions()
    {
        using var factory = new DigiSayApiFactory();
        using var client = factory.CreateClient();
        var statuses = new List<HttpStatusCode>();

        for (var index = 0; index < 6; index++)
        {
            using var response = await client.PostAsJsonAsync("/api/v1/contact-inquiries", ValidRequest());
            statuses.Add(response.StatusCode);
        }

        Assert.All(statuses.Take(5), status => Assert.Equal(HttpStatusCode.Created, status));
        Assert.Equal(HttpStatusCode.TooManyRequests, statuses[^1]);
        Assert.Equal(5, factory.Writer.Saved.Count);
    }

    private static object ValidRequest() => new
    {
        firstName = "  Ada ",
        lastName = " Lovelace ",
        email = " ada@example.com ",
        phone = "+1 555 0100",
        service = " Strategy ",
        message = "Please contact me.",
        botField = "",
    };
}
