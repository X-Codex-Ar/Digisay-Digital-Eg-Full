namespace DigiSay.Domain.Exceptions;

public sealed class DomainValidationException(string propertyName, string message) : Exception(message)
{
    public string PropertyName { get; } = propertyName;
}
