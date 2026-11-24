# Azure deployment

No Azure resources or deployment workflow are configured. The API targets ASP.NET Core 10 LTS. Deployment requires managed SQL connectivity, Key Vault/managed identity, trusted CORS settings, TLS, health probes, logs/traces/alerts, reviewed database migration controls, and rollback procedures. Configure CI/CD only after target subscriptions, environments, and access policies are defined. No production secret belongs in repository files or frontend bundles.

## Authentication production release gate

Do not enable Identity authentication for production traffic until all of these are complete:

- Configure ASP.NET Core Data Protection with a persistent, shared, protected key ring and a stable application name.
- Verify that refresh credentials remain valid after an API restart and when a different API instance handles the request.
- Store SMTP credentials and all database, storage, and bootstrap secrets in the managed secret store.

The repository does not yet configure the shared Data Protection key ring or verify token validity across restarts and instances. Treat those as release blockers, not optional deployment improvements.
