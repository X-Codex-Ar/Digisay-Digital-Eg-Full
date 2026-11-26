using DigiSay.API.Endpoints.Crm;
using DigiSay.Application.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Xunit;

namespace DigiSay.API.IntegrationTests;

public sealed class CrmConcurrencyFilterTests
{
    [Fact]
    public async Task Concurrency_conflict_is_returned_as_409_instead_of_an_unhandled_error()
    {
        var filter = new DomainValidationEndpointFilter();
        var context = new DefaultEndpointFilterInvocationContext(new DefaultHttpContext());

        var result = await filter.InvokeAsync(
            context,
            _ => throw new ConcurrencyConflictException("The record was changed by another request."));

        var problem = Assert.IsType<ProblemHttpResult>(result);
        Assert.Equal(StatusCodes.Status409Conflict, problem.StatusCode);
    }
}
