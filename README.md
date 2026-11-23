# DigiSay Group — Digital Media Solutions Platform

## Platform status

The existing public website is preserved as the React 19/TanStack Start app in root `public/`. A separate Angular app lives in root `dashboard/`. The ASP.NET Core 9 API and SQL Server schema scripts live in `backend/` and `database/`. The public site records Firebase Analytics page views and sends contact inquiries to the API when configured. Supabase Postgres is an optional API health-checked connection; no Supabase password was supplied, so it is not connected yet. Identity, protected client/admin workflows, containers, and deployment are **not implemented yet**.

## Repository structure

```text
public/            React public website (existing routes, features and static assets)
dashboard/         Angular client and admin dashboard
backend/           .NET Clean Architecture solution
packages/design-system/ Shared DigiSay Tailwind theme and design tokens
infrastructure/    Local/cloud deployment assets (later phase)
database/          Versioned SQL Server scripts and database operations
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

The backend targets ASP.NET Core 9 and requires the SQL Server connection from local User Secrets for readiness and contact storage. Supabase Postgres uses an optional separate secret. Review [`database/README.md`](database/README.md) and [`backend/README.md`](backend/README.md) before configuring local access. .NET 9 reached end of support on November 10, 2026; plan an upgrade to .NET 10 LTS before production deployment. See the [official .NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core).

## Architecture documentation

- [System architecture](docs/architecture/SYSTEM-ARCHITECTURE.md)
- [Clean Architecture boundaries](docs/architecture/CLEAN-ARCHITECTURE.md)
- [Domain modules and status](docs/architecture/DOMAIN-MODULES.md)
- [Database ownership](docs/database/DATABASE-OWNERSHIP.md)
- [API conventions](docs/api/API-CONVENTIONS.md)
- [Security requirements](docs/security/SECURITY-REQUIREMENTS.md)
