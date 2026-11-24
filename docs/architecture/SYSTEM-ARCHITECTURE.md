# System architecture

## Current state

The repository has three independent root apps: a server-rendered React 19 public website, an Angular client/admin dashboard, and an ASP.NET Core 10 API. See [REPOSITORY-AUDIT.md](REPOSITORY-AUDIT.md) for current phase status.

## Target shape

The public React app is in root `public/` (Vite assets in `public/static/`), Angular is in root `dashboard/`, and the independently deployable ASP.NET Core 10 modular monolith is in `backend/` with Domain, Application, Infrastructure, and API boundaries. The API stores validated public contact inquiries in SQL Server. The dashboard checks API/SQL readiness. No protected client/admin business endpoints or identity system are implemented yet.

SQL Server is the authoritative store for transactional entities. Supabase Postgres is configured as an optional connectivity-only backend capability until a named data workflow, password, ownership model, and RLS policy exist. Firebase Analytics records public-site page views; Firebase Auth, Firestore, FCM, and Admin are not enabled. Cross-store business events must use a durable SQL outbox; no cross-store events or delivery guarantees are implemented yet.

## Request flow (target)

```text
Public React / Angular dashboard
        | HTTPS, typed versioned API
        v
ASP.NET Core API -> Application use cases -> Domain rules
                           |                   |
                           v                   v
                  Infrastructure adapters -> SQL Server (system of record)
                                               | transactional outbox (planned)
                                               +--> Supabase (optional, not yet used for business data)
```

Do not expose infrastructure entities to either frontend. Enforce tenant and resource authorization in the API.

## Operational boundary

The API validates required SQL Server configuration at startup. `/health/ready` checks SQL Server and optionally Supabase Postgres; `/api/v1/health` is a versioned process liveness route. Public contact posts are validated, honeypot-screened, rate-limited, and persisted. OpenAPI is served only in Development. Production secret management, authentication, observability, Docker, CI, and Azure configuration remain outstanding.
