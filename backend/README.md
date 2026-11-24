# DigiSay API foundation

This folder contains the ASP.NET Core 10 modular-monolith API with SQL Server contact-inquiry persistence and an optional Supabase Postgres connectivity check. It also provides OpenAPI in Development, ProblemDetails, versioned routes, CORS, rate limiting, and database readiness checks. Identity and protected client/admin workflows remain unimplemented.

## Prerequisites

- .NET 10 SDK (the repository `global.json` selects the latest installed .NET 10 feature band).
- SQL Server for readiness checks.

## Configure and run

Set `ConnectionStrings:SqlServer` with User Secrets for local development or `ConnectionStrings__SqlServer` from a managed secret store in deployment. Never commit a real connection string.

Optional Supabase database reachability uses `ConnectionStrings:SupabasePostgres` or `ConnectionStrings__SupabasePostgres`. It is TLS-only and uses a small connection pool. The Supabase password placeholder supplied for this project still needs to be replaced in local User Secrets before that check can connect.

```powershell
dotnet restore DigiSay.sln
dotnet build DigiSay.sln --no-restore
dotnet test DigiSay.sln --no-build
dotnet run --project src/DigiSay.Api
```

NuGet versions are centrally managed in `Directory.Packages.props`. Restore writes per-project lock files; commit lock-file changes when package references change. Package vulnerability auditing is enabled during restore.

`GET /api/v1/health` reports API process liveness. `GET /health/ready` checks SQL Server and also Supabase Postgres when configured. `POST /api/v1/contact-inquiries` validates and rate-limits public inquiries before storing them in SQL Server. OpenAPI is available only in Development.

Review and manually apply `database/sqlserver/001_contact_inquiries.sql` before enabling the contact endpoint against a database. The application never mutates schema automatically at startup. No Supabase schema is applied by this change.
