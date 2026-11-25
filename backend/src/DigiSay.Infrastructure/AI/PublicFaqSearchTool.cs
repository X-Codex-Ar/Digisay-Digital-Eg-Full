using System.Text.RegularExpressions;
using DigiSay.Application.Features.AI.PublicAssistant;

namespace DigiSay.Infrastructure.AI;

/// <summary>Draft public FAQ corpus derived from the public site; product owner review is required before enablement.</summary>
public sealed class PublicFaqSearchTool : IPublicFaqSearchTool
{
    /// <summary>Identifies the reviewed corpus content. Change it whenever any source text changes.</summary>
    public const string CorpusVersion = "public-faq-draft-1";

    private static readonly PublicFaqSource[] Sources =
    [
        new("services", "DigiSay services", "/services",
            "DigiSay provides digital media services including content production, content management, social media, growth marketing, influencer marketing, and digital rights and anti-piracy support. Refer visitors to the services page for current details. الخدمات التي تقدمها ديجي ساي تشمل إنتاج المحتوى وإدارته، وإدارة وسائل التواصل الاجتماعي، والتسويق والنمو، والتسويق عبر المؤثرين، ودعم الحقوق الرقمية ومكافحة القرصنة. التفاصيل الحالية موجودة في صفحة الخدمات."),
        new("anti-piracy", "Digital rights and anti-piracy", "/anti-piracy",
            "DigiSay describes content monitoring, detection, digital rights support, and takedown services on its anti-piracy page. Do not promise a specific removal outcome or timeline. تعرض ديجي ساي خدمات مراقبة المحتوى واكتشاف الاستخدام غير المصرح به ودعم الحقوق الرقمية وطلبات الإزالة. لا تعد بنتيجة أو موعد محدد."),
        new("content-production", "Content production", "/content-production",
            "DigiSay offers content production services. The public page contains current service descriptions and examples; the assistant must not invent package details or prices. تقدم ديجي ساي خدمات إنتاج المحتوى. تعرض الصفحة العامة التفاصيل والأمثلة الحالية؛ لا تخترع تفاصيل باقات أو أسعاراً."),
        new("contact", "Contact DigiSay", "/contact",
            "Visitors can contact DigiSay using the website contact form. Do not collect or repeat email addresses, phone numbers, or confidential information in chat. يمكن للزوار التواصل مع ديجي ساي من خلال نموذج التواصل على الموقع. لا تطلب أو تكرر عناوين البريد أو أرقام الهاتف أو المعلومات السرية في المحادثة."),
    ];

    private static readonly HashSet<string> StopWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "a", "an", "and", "are", "can", "do", "does", "for", "how", "i", "is", "me", "of", "on", "or", "the", "to", "we", "what", "with", "you", "your",
        "ايه", "هل", "ما", "ماذا", "من", "في", "على", "الى", "إلى", "عن", "مع", "هو", "هي", "كم",
    };

    public Task<IReadOnlyList<PublicFaqSource>> SearchAsync(
        string question,
        int maximumResults,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var terms = Regex.Matches(question.ToLowerInvariant(), @"[\p{L}\p{N}]{3,}")
            .Select(match => match.Value)
            .Where(term => !StopWords.Contains(term))
            .Distinct(StringComparer.Ordinal)
            .ToArray();

        if (terms.Length == 0 || maximumResults <= 0)
        {
            return Task.FromResult<IReadOnlyList<PublicFaqSource>>([]);
        }

        var matches = Sources
            .Select(source => new
            {
                Source = source,
                Score = terms.Count(term =>
                    (source.Title + " " + source.Content).Contains(term, StringComparison.OrdinalIgnoreCase)),
            })
            .Where(match => match.Score > 0)
            .OrderByDescending(match => match.Score)
            .ThenBy(match => match.Source.Id, StringComparer.Ordinal)
            .Take(Math.Min(maximumResults, 4))
            .Select(match => match.Source)
            .ToArray();

        return Task.FromResult<IReadOnlyList<PublicFaqSource>>(matches);
    }
}
