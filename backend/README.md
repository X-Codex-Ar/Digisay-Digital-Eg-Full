# DigiSay API foundation

This folder contains the .NET 10 modular-monolith backend split into Domain, Application, Infrastructure, and API projects. It includes SQL Server persistence, ASP.NET Core Identity, organization membership and tenant-scoped CRM lead and service-request workflows, an optional Supabase Postgres connectivity check, versioned Minimal API routes, OpenAPI in Development, ProblemDetails, CORS, rate limiting, and readiness checks.

## Prerequisites

- .NET 10 SDK (the repository `global.json` selects the latest installed .NET 10 feature band).
- SQL Server for readiness checks.
- SMTP credentials for account confirmation and password recovery outside Development.

## Configure and run

Set `ConnectionStrings:SqlServer` with User Secrets for local development or `ConnectionStrings__SqlServer` from a managed secret store in deployment. Never commit a real connection string.

In Development, confirmation and recovery links are written to the API log when SMTP is not configured. To send them through Gmail locally, store `Email:Smtp:Host=smtp.gmail.com`, `Port=587`, `UserName`, `Password`, and `FromAddress` in User Secrets. With SMTP configured, those settings are validated at startup and the API sends using TLS. Other environments also require these settings from a managed secret store. Never commit the app password.

Optional Supabase database reachability uses `ConnectionStrings:SupabasePostgres` or `ConnectionStrings__SupabasePostgres`. It is TLS-only and uses a small connection pool. The Supabase password placeholder supplied for this project still needs to be replaced in local User Secrets before that check can connect.

```powershell
dotnet restore DigiSay.sln
dotnet build DigiSay.sln --no-restore
dotnet test DigiSay.sln --configuration Release
dotnet run --project src/DigiSay.API
```

The API integration tests use a disposable SQL Server database. Set `TEST_SQLSERVER_CONNECTION_STRING` to a SQL Server instance where the test user can create databases before running the suite. Each test factory creates a uniquely named database; never point this variable at production or a database with user data. CI starts an isolated SQL Server service for this job.

Install the matching EF Core CLI and apply versioned schema changes deliberately (the API never migrates at startup):

```powershell
dotnet tool install --global dotnet-ef --version 10.0.15
dotnet ef database update --project src/DigiSay.Infrastructure --startup-project src/DigiSay.API
```

NuGet versions are centrally managed in `Directory.Packages.props`. Restore writes per-project lock files; commit lock-file changes when package references change. Package vulnerability auditing is enabled during restore.

`GET /api/v1/health` reports API process liveness. `GET /health/ready` checks SQL Server and also Supabase Postgres when configured. `POST /api/v1/contact-inquiries` validates and rate-limits public inquiries before storing them in SQL Server. Identity endpoints are under `/api/v1/auth`; use short-lived bearer tokens for the separate SPA clients, keep tokens in memory, and use `/refresh` to obtain replacement credentials. The API uses 15-minute access tokens and 7-day refresh tokens. OpenAPI is available only in Development.

`GET /api/v1/users/me` requires authentication. New registrations have no application role and cannot access role-protected workflows. The role list is seeded by the EF migration; administrative role assignment remains follow-up work. `POST /api/v1/organizations` creates an organization and active owner membership; `GET /api/v1/organizations` returns only the signed-in user's active memberships. `GET /api/v1/organizations/current` requires an `X-Organization-Id` selector and verifies the authenticated user has an active membership before resolving it. CRM routes are under `/api/v1/crm/leads` and `/api/v1/crm/service-requests`; their queries and writes are scoped to the verified organization, with owner-only mutation operations.

## Private Supabase Storage

Create a **private** Storage bucket first. Configure the API with a server-only Supabase secret key (the current `sb_secret_...` key or a legacy service-role key during key migration). Keep it out of React and Angular environment files. For local development, set these User Secrets from `backend/`:

```powershell
dotnet user-secrets set "Storage:Supabase:ProjectUrl" "https://<project-ref>.supabase.co" --project src/DigiSay.API
dotnet user-secrets set "Storage:Supabase:SecretKey" "<server-only-secret-key>" --project src/DigiSay.API
dotnet user-secrets set "Storage:Supabase:PrivateBucket" "digisay-private" --project src/DigiSay.API
```

Deployments can provide `Storage__Supabase__ProjectUrl`, `Storage__Supabase__SecretKey`, and `Storage__Supabase__PrivateBucket` from a managed secret/configuration store. The API validates these settings at startup. Its storage adapter uses the server secret, which bypasses Supabase Storage RLS; the API therefore requires authenticated active organization membership and derives every object path itself as `organizations/{organization-id}/{object-id}`. Clients cannot provide a bucket, path, organization ID, filename, or accepted content type. Uploads are limited to 10 MiB and signature-checked PDF, JPEG, and PNG files. New objects are immutable and use random identifiers.

`POST /api/v1/storage/objects` and `DELETE /api/v1/storage/objects/{objectId}` require an active organization owner. `POST /api/v1/storage/objects/{objectId}/download-link` requires active membership in the selected organization and returns a five-minute signed URL with download disposition. Treat that URL as a bearer credential until it expires. Individual signed URLs cannot be revoked; deleting the object invalidates its link. A missing or cross-tenant object returns 404; provider failures return a generic 502 without forwarding provider details. Objects remain until an owner deletes them or an operational retention process removes them.

The bucket must remain private; do not grant browser clients direct access or embed the server secret in frontend builds. Supabase documents that server secret keys bypass Storage RLS and that signed URLs grant time-limited access: [Storage access control](https://supabase.com/docs/guides/storage/security/access-control), [serving private assets](https://supabase.com/docs/guides/storage/serving/downloads), and [signed URL key rotation](https://supabase.com/docs/guides/storage/security/signing-keys).

The source projects follow inward dependency direction: Domain has no project dependencies, Application depends on Domain, Infrastructure implements persistence and integrations for Application, and API composes the application. HTTP routes use Minimal API endpoint modules under `DigiSay.API/Endpoints`. Tests are separated into Domain, Application, Infrastructure, and API integration projects under `tests/`.

Bearer clients sign out by deleting both tokens; the built-in bearer scheme does not track single-use refresh-token rotation or immediately revoke a copied access token. Cookie clients can call `/api/v1/auth/logout`.

The EF migration is the schema source of truth. Its baseline creates `ContactInquiries` only when missing, so it can be applied to databases where the legacy `001_contact_inquiries.sql` script was already run. Rollback intentionally preserves that table and its data.
