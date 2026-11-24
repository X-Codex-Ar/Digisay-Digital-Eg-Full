using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace DigiSay.API.IntegrationTests;

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
        using var retryResponse = await client.PostAsJsonAsync("/api/v1/contact-inquiries", ValidRequest());
        Assert.Equal(TimeSpan.FromSeconds(600), retryResponse.Headers.RetryAfter?.Delta);
        Assert.Equal(5, factory.Writer.Saved.Count);
    }

    [Fact]
    public async Task Untrusted_forwarded_headers_do_not_change_the_client_rate_limit_identity()
    {
        using var factory = new DigiSayApiFactory();
        using var client = factory.CreateClient();
        var statuses = new List<HttpStatusCode>();

        for (var index = 0; index < 6; index++)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/contact-inquiries")
            {
                Content = JsonContent.Create(ValidRequest()),
            };
            request.Headers.TryAddWithoutValidation("X-Forwarded-For", $"198.51.100.{index + 1}");
            using var response = await client.SendAsync(request);
            statuses.Add(response.StatusCode);
        }

        Assert.All(statuses.Take(5), status => Assert.Equal(HttpStatusCode.Created, status));
        Assert.Equal(HttpStatusCode.TooManyRequests, statuses[^1]);
    }

    [Fact]
    public async Task Trusted_proxy_forwarded_addresses_are_used_for_rate_limit_identity()
    {
        using var factory = new DigiSayApiFactory(trustLoopbackProxy: true);
        using var client = factory.CreateClient();

        for (var index = 0; index < 6; index++)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/contact-inquiries")
            {
                Content = JsonContent.Create(ValidRequest()),
            };
            request.Headers.TryAddWithoutValidation("X-Forwarded-For", $"198.51.100.{index + 1}");
            using var response = await client.SendAsync(request);
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }
    }

    [Fact]
    public async Task Proxy_chain_limit_uses_only_the_configured_nearest_forwarded_hop()
    {
        using var factory = new DigiSayApiFactory(trustLoopbackProxy: true);
        using var client = factory.CreateClient();
        var statuses = new List<HttpStatusCode>();

        for (var index = 0; index < 6; index++)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/contact-inquiries")
            {
                Content = JsonContent.Create(ValidRequest()),
            };
            request.Headers.TryAddWithoutValidation("X-Forwarded-For", $"198.51.100.{index + 1}, 203.0.113.9");
            using var response = await client.SendAsync(request);
            statuses.Add(response.StatusCode);
        }

        Assert.All(statuses.Take(5), status => Assert.Equal(HttpStatusCode.Created, status));
        Assert.Equal(HttpStatusCode.TooManyRequests, statuses[^1]);
    }

    [Fact]
    public async Task Rate_limit_store_failure_fails_closed_with_generic_retry_metadata()
    {
        using var factory = new DigiSayApiFactory(rateLimitStoreUnavailable: true);
        using var client = factory.CreateClient();

        using var response = await client.PostAsJsonAsync("/api/v1/contact-inquiries", ValidRequest());
        var body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Equal(TimeSpan.FromSeconds(5), response.Headers.RetryAfter?.Delta);
        Assert.DoesNotContain("Test rate-limit backend unavailable", body, StringComparison.Ordinal);
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
