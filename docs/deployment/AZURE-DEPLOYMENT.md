# Azure deployment

No Azure resources or deployment workflow are configured. The API targets ASP.NET Core 10 LTS. Deployment requires managed SQL connectivity, Key Vault/managed identity, trusted CORS settings, TLS, health probes, logs/traces/alerts, reviewed database migration controls, and rollback procedures. Configure CI/CD only after target subscriptions, environments, and access policies are defined. No production secret belongs in repository files or frontend bundles.
