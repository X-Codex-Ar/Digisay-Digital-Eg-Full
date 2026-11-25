# System architecture

## Current state

The repository has three independent root apps: a server-rendered React 19 public website, an Angular client/admin dashboard, and an ASP.NET Core 10 API. See [REPOSITORY-AUDIT.md](REPOSITORY-AUDIT.md) for current phase status.

## Target shape

The public React app is in root `public/` (Vite assets in `public/static/`), Angular is in root `dashboard/`, and the independently deployable ASP.NET Core 10 modular monolith is in `backend/` with Domain, Application, Infrastructure, and API boundaries. The API stores public contact inquiries, Identity, organizations, memberships, and tenant-owned CRM leads and service requests in SQL Server. Protected CRM endpoints require verified active membership, and tenant-owned CRM EF queries also apply global filters from the request-scoped organization context.

SQL Server is the authoritative store for transactional entities. Supabase Postgres is an optional health-check capability; Supabase Storage holds private binary objects behind the API. Firebase Analytics records public-site page views; Firebase Auth, Firestore, FCM, and Admin are not enabled. CRM writes persist versioned outbox events atomically. The dispatcher currently uses a logging publisher; no external projection consumer is configured.

## Request flow (target)

```text
Public React / Angular dashboard
        | HTTPS, typed versioned API
        v
ASP.NET Core API -> Application use cases -> Domain rules
                           |                   |
                           v                   v
                  Infrastructure adapters -> SQL Server (system of record)
                           |                   + transactional outbox (CRM events)
                           +--> Supabase Storage (private binary objects)
```

Do not expose infrastructure entities to either frontend. Enforce tenant and resource authorization in the API.

## Operational boundary

The API validates required SQL Server configuration at startup. `/health/ready` checks SQL Server and optionally Supabase Postgres; `/api/v1/health` is a versioned process liveness route. Public contact posts are validated, honeypot-screened, rate-limited, and persisted. Identity uses short-lived opaque bearer tokens and SMTP for account confirmation/recovery. Tenant ownership is verified from active SQL Server membership; the `X-Organization-Id` header selects a tenant and never proves access. Storage uses a server-side secret and tenant-derived object paths. Shared Data Protection keys, production observability, Docker, CI, and Azure configuration remain deployment follow-up work.
