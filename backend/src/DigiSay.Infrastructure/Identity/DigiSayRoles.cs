namespace DigiSay.Infrastructure.Identity;

public static class DigiSayRoles
{
    public const string SuperAdmin = "SuperAdmin";
    public const string Admin = "Admin";
    public const string Manager = "Manager";
    public const string Sales = "Sales";
    public const string ContentManager = "ContentManager";
    public const string MarketingManager = "MarketingManager";
    public const string ProductionManager = "ProductionManager";
    public const string RightsManager = "RightsManager";
    public const string Finance = "Finance";
    public const string Support = "Support";
    public const string Client = "Client";

    public static readonly IReadOnlyList<string> All =
    [
        SuperAdmin,
        Admin,
        Manager,
        Sales,
        ContentManager,
        MarketingManager,
        ProductionManager,
        RightsManager,
        Finance,
        Support,
        Client,
    ];
}
