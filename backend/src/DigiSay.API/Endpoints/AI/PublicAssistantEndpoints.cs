using Asp.Versioning;
using Asp.Versioning.Builder;
using DigiSay.API.RateLimiting;
using DigiSay.Application.Features.AI.PublicAssistant;
using DigiSay.Infrastructure.AI;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DigiSay.API.Endpoints.AI;

internal static class PublicAssistantEndpoints
{
    public static RouteGroupBuilder MapPublicAssistantEndpoints(this RouteGroupBuilder versionedApi)
    {
        versionedApi.MapPost("/ai/public-chat", async (
                PublicAssistantRequest? request,
                PublicFaqAssistantHandler handler,
                IOptions<PublicAssistantOptions> featureOptions,
                CancellationToken cancellationToken) =>
            {
                if (!featureOptions.Value.Enabled)
                {
                    return Results.NotFound();
                }

                if (request is null || string.IsNullOrWhiteSpace(request.Question) ||
                    request.Question.Length > PublicFaqAssistantHandler.MaximumQuestionLength)
                {
                    return Results.ValidationProblem(new Dictionary<string, string[]>
                    {
                        [nameof(request.Question)] = [$"Question must contain between 1 and {PublicFaqAssistantHandler.MaximumQuestionLength} characters."],
                    });
                }

                try
                {
                    var answer = await handler.HandleAsync(request.Question, cancellationToken);
                    return Results.Ok(answer);
                }
                catch (PublicAssistantInputException exception)
                {
                    return Results.ValidationProblem(new Dictionary<string, string[]> { [nameof(request.Question)] = [exception.Message] });
                }
                catch (PublicAssistantUnavailableException)
                {
                    return Results.Problem(
                        statusCode: StatusCodes.Status503ServiceUnavailable,
                        title: "The assistant is temporarily unavailable.");
                }
            })
            .WithName("AskPublicAssistant")
            .WithSummary("Ask a read-only assistant grounded in approved public DigiSay FAQs.")
            .MapToApiVersion(new ApiVersion(1, 0))
            .AllowAnonymous()
            .WithMetadata(new RequestSizeLimitAttribute(4 * 1024))
            .WithMetadata(new RateLimitPolicy("public-ai-chat", 10, TimeSpan.FromMinutes(1)))
            .AddEndpointFilter<DistributedRateLimitFilter>();

        return versionedApi;
    }

    private sealed record PublicAssistantRequest(string? Question);
}
