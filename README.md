# DigiSay Group — Digital Media Solutions Platform

## Platform status

The existing public website is preserved as the React 19/TanStack Start app in root `public/`. A separate Angular app lives in root `dashboard/`. The ASP.NET Core 10 API and SQL Server schema scripts live in `backend/` and `database/`. The public site records Firebase Analytics page views and sends contact inquiries to the API when configured. Supabase Postgres is an optional API health-checked connection; no Supabase password was supplied, so it is not connected yet. Identity, protected client/admin workflows, containers, and deployment are **not implemented yet**.

## Repository structure

```text
public/            React public website (owns src/styles/tailwind-theme.css)
dashboard/         Angular dashboard (owns matching src/styles/tailwind-theme.css)
backend/           .NET Clean Architecture solution
database/          Versioned SQL Server scripts and database operations
devops/            Deployment, CI/CD, containers, and infrastructure definitions
storage/           Centralized media, static fallback, and Supabase Storage bucket schemas
testing/           Cross-platform end-to-end and integration test suites
ai-agents/         AI agent workflows, rights automation, and intelligence services
docs/              Architecture, API, security and operations documentation
```

## Local development

The apps are independent projects; their source files and dependencies live in their own folders. Install and run them from the repository root with:

```powershell
pnpm run install:all
pnpm run dev:public
pnpm run dev:dashboard
pnpm run dev:api
pnpm run test
pnpm run build
```

The backend targets ASP.NET Core 10 and requires the SQL Server connection from local User Secrets for readiness and contact storage. Supabase Postgres uses an optional separate secret. Review [`database/README.md`](database/README.md) and [`backend/README.md`](backend/README.md) before configuring local access. The repository requires the .NET 10 SDK; the [official support policy](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core) lists .NET 10 LTS support through November 2028.

## Architecture documentation

- [System architecture](docs/architecture/SYSTEM-ARCHITECTURE.md)
- [Clean Architecture boundaries](docs/architecture/CLEAN-ARCHITECTURE.md)
- [Domain modules and status](docs/architecture/DOMAIN-MODULES.md)
- [Database ownership](docs/database/DATABASE-OWNERSHIP.md)
- [API conventions](docs/api/API-CONVENTIONS.md)
- [Security requirements](docs/security/SECURITY-REQUIREMENTS.md)
