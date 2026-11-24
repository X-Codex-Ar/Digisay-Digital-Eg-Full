using System.Text.RegularExpressions;
using DigiSay.Domain.Exceptions;

namespace DigiSay.Domain.ValueObjects;

public readonly record struct EmailAddress
{
    private static readonly Regex Pattern = new(@"^[^\s@]+@[^\s@]+\.[^\s@]+$", RegexOptions.Compiled | RegexOptions.CultureInvariant);

    private EmailAddress(string value) => Value = value;

    public string Value { get; }

    public static EmailAddress Create(string? value)
    {
        var normalized = value?.Trim();
        if (string.IsNullOrWhiteSpace(normalized) || normalized.Length > 254 || !Pattern.IsMatch(normalized))
        {
            throw new DomainValidationException(nameof(Value), "A valid email address is required.");
        }

        return new EmailAddress(normalized.ToLowerInvariant());
    }

    public override string ToString() => Value;
}
