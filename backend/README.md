# DigiSay API foundation

This folder contains the .NET 10 modular-monolith backend split into Domain, Application, Infrastructure, and API projects. It includes SQL Server persistence, ASP.NET Core Identity, verified organization membership, tenant-scoped CRM lead and service-request workflows with global EF filters, a transactional SQL outbox, private Supabase Storage, an optional Supabase Postgres connectivity check, versioned Minimal API routes, distributed rate limiting, and readiness checks.

## Prerequisites

- .NET 10 SDK (the repository `global.json` selects the latest installed .NET 10 feature band).
- SQL Server for readiness checks.
- SMTP credentials for account confirmation and password recovery outside Development.

## Configure and run

Set `ConnectionStrings:SqlServer` with User Secrets for local development or `ConnectionStrings__SqlServer` from a managed secret store in deployment. Never commit a real connection string.

Rate limiting defaults to an in-process store in Development so local work needs no Redis service. Every non-Development environment must set `RateLimiting__RedisConnectionString` to a managed Redis-compatible service and `RateLimiting__KeyHashSecret` to a random secret with at least 32 UTF-8 bytes. Redis counters use atomic fixed windows shared across API instances. Public contact submissions allow 5 requests per client identity per 10 minutes; identity authentication routes allow 10 per client identity per 10 minutes. Authenticated calls key by user ID; anonymous calls key by the validated remote IP. The raw identity is HMAC-SHA256 hashed before it is sent to Redis. If Redis is unavailable, the API rejects protected requests with a generic 503 and `Retry-After: 5` rather than disabling protection. Rate limit responses use 429 and a `Retry-After` value in seconds.

Forwarded headers are ignored unless the sending proxy is explicitly listed under `ForwardedHeaders__KnownProxies__0` or its network under `ForwardedHeaders__KnownNetworks__0` (CIDR notation). Keep `ForwardLimit` equal to the number of trusted proxy hops that append forwarding headers; it defaults to 1 and accepts 1–10. Do not list a whole subnet unless every host in it is a controlled proxy. Without an allowlist, the API uses the direct connection address and client-supplied forwarding headers cannot change rate-limit identity. In the ingress environment, verify both cases: an allowed proxy should supply the expected client address, while an untrusted source's `X-Forwarded-For` must be ignored. Forwarded-header middleware runs before authentication and rate limiting.

In Development, confirmation and recovery links are written to the API log when SMTP is not configured. To send them through Gmail locally, store `Email:Smtp:Host=smtp.gmail.com`, `Port=587`, `UserName`, `Password`, and `FromAddress` in User Secrets. With SMTP configured, those settings are validated at startup and the API sends using TLS. Other environments also require these settings from a managed secret store. Never commit the app password.

Optional Supabase database reachability uses `ConnectionStrings:SupabasePostgres` or `ConnectionStrings__SupabasePostgres`. It is TLS-only and uses a small connection pool. The Supabase password placeholder supplied for this project still needs to be replaced in local User Secrets before that check can connect.

```powershell
dotnet restore DigiSay.sln
dotnet build DigiSay.sln --no-restore
dotnet test DigiSay.sln --configuration Release
dotnet run --project src/DigiSay.API
```

Backend tests are split across `tests/DigiSay.Domain.Tests`, `tests/DigiSay.Application.Tests`, `tests/DigiSay.Infrastructure.Tests`, and `tests/DigiSay.API.IntegrationTests`. From the repository root, run `dotnet restore backend/DigiSay.sln --locked-mode` and `dotnet test backend/DigiSay.sln --configuration Release`. For focused commands and suite details, see [`testing/README.md`](../testing/README.md). API integration tests require a disposable SQL Server instance configured through `TEST_SQLSERVER_CONNECTION_STRING`; each test factory creates a uniquely named database, so never point it at production or a database with user data. CI starts an isolated SQL Server service for these tests.

Install the matching EF Core CLI and apply versioned schema changes deliberately (the API never migrates at startup):

```powershell
dotnet tool install --global dotnet-ef --version 10.0.15
dotnet ef database update --project src/DigiSay.Infrastructure --startup-project src/DigiSay.API
```

NuGet versions are centrally managed in `Directory.Packages.props`. Restore writes per-project lock files; commit lock-file changes when package references change. Package vulnerability auditing is enabled during restore.

`GET /api/v1/health` reports API process liveness. `GET /health/ready` checks SQL Server and also Supabase Postgres when configured. `POST /api/v1/contact-inquiries` validates and rate-limits public inquiries before storing them in SQL Server. Identity endpoints are under `/api/v1/auth`; use short-lived bearer tokens for the separate SPA clients, keep tokens in memory, and use `/refresh` to obtain replacement credentials. The API uses 15-minute access tokens and 7-day refresh tokens. OpenAPI is available only in Development.

`GET /api/v1/users/me` requires authentication. New registrations have no application role and cannot access role-protected workflows. The role list is seeded by the EF migration. To bootstrap the first SuperAdmin, configure a one-time `Identity:BootstrapAdminSecret` (at least 32 bytes), register and confirm the intended account, sign in, then call `POST /api/v1/auth/bootstrap-admin` with that secret. For local development, set it with `dotnet user-secrets set "Identity:BootstrapAdminSecret" "<one-time-random-secret>" --project src/DigiSay.API`. Sign in again after bootstrap to receive the SuperAdmin role claim. The endpoint accepts only a confirmed signed-in account and only while no SuperAdmin exists; remove the secret from deployment configuration immediately after success. SuperAdmins can list accounts, replace roles through `PUT /api/v1/admin/users/{userId}/roles`, and revoke an account's sessions with `POST /api/v1/admin/users/{userId}/revoke-sessions`. Users can revoke their own sessions with `POST /api/v1/auth/sessions/revoke`. Role changes and revocation update the Identity security stamp: refresh tokens are rotated and rejected on reuse, cookie sessions are revalidated within five minutes, and already-issued 15-minute bearer access tokens can remain usable until expiry. The built-in bearer scheme uses an account-level security stamp, so refreshing or revoking one session invalidates other refresh tokens for that account as well. For browser SPAs, use bearer tokens in memory and send them in the `Authorization` header; do not persist them in local or session storage. The optional cookie flow uses HttpOnly, SameSite=Strict cookies, does not enable cross-origin credentialed CORS, and uses Secure cookies outside Development. `GET /api/v1/organizations` returns only the signed-in user's active memberships. `GET /api/v1/organizations/current` requires an `X-Organization-Id` selector and verifies the authenticated user has an active membership before resolving it. CRM routes are under `/api/v1/crm/leads` and `/api/v1/crm/service-requests`: leads and request review require `AdminAccess`; clients can submit, list, and inspect only requests in their verified organization; request updates and lifecycle transitions require `AdminAccess` plus Owner membership. The EF Core model also applies global query filters to leads and service requests using that verified request context, so direct queries without an established organization scope return no CRM rows. CRM query filters and explicit store predicates are covered by SQL Server integration tests.

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

Bearer clients should keep tokens in memory and call `/api/v1/auth/sessions/revoke` when they need server-side refresh-session revocation; clear both tokens locally as well. Cookie clients can call `/api/v1/auth/logout`. SMTP delivery is configured through a managed secret store; automated API tests use a fake email sender and do not verify delivery against a live SMTP provider.

CRM writes add a versioned outbox event in the same SQL Server `SaveChanges` transaction. The hosted dispatcher uses leases, bounded retries, and dead-letter state. Its current publisher is a local logging sink; no external projection is configured. See [`OUTBOX-PATTERN.md`](../docs/integrations/OUTBOX-PATTERN.md) for delivery semantics and [`database/README.md`](../database/README.md) for migration and rollback risks.

The EF migration is the schema source of truth. Its baseline creates `ContactInquiries` only when missing, so it can be applied to databases where the legacy `001_contact_inquiries.sql` script was already run. Rollback intentionally preserves that table and its data. See [`CONFIGURATION.md`](../docs/deployment/CONFIGURATION.md) for the setting inventory.
