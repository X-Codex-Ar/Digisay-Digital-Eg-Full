namespace DigiSay.Domain;

public sealed class ContactInquiry
{
    private ContactInquiry() { }

    private ContactInquiry(
        Guid id,
        string firstName,
        string lastName,
        string email,
        string? phone,
        string service,
        string? message,
        DateTimeOffset createdAtUtc,
        string? sourceIp)
    {
        Id = id;
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        Phone = phone;
        Service = service;
        Message = message;
        CreatedAtUtc = createdAtUtc;
        SourceIp = sourceIp;
    }

    public Guid Id { get; private set; }
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string? Phone { get; private set; }
    public string Service { get; private set; } = string.Empty;
    public string? Message { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public string? SourceIp { get; private set; }

    public static ContactInquiry Create(
        string firstName,
        string lastName,
        string email,
        string? phone,
        string service,
        string? message,
        string? sourceIp) => new(
            Guid.NewGuid(),
            firstName.Trim(),
            lastName.Trim(),
            email.Trim(),
            string.IsNullOrWhiteSpace(phone) ? null : phone.Trim(),
            service.Trim(),
            string.IsNullOrWhiteSpace(message) ? null : message.Trim(),
            DateTimeOffset.UtcNow,
            sourceIp);
}
