namespace DigiSay.Domain.Organizations;

public sealed class Organization
{
    private Organization() { }

    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAtUtc { get; private set; }

    public static Organization Create(string name)
    {
        var normalizedName = name?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedName) || normalizedName.Length is < 2 or > 120)
        {
            throw new ArgumentException("Organization name must contain 2 to 120 characters.", nameof(name));
        }

        return new Organization
        {
            Id = Guid.NewGuid(),
            Name = normalizedName,
            CreatedAtUtc = DateTimeOffset.UtcNow,
        };
    }
}
