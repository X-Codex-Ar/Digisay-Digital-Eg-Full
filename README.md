# DigiSay Group — Digital Media Solutions Platform

## Platform status

The existing public website is preserved as the React 19/TanStack Start app in root `public/`. A separate Angular app lives in root `dashboard/`. The ASP.NET Core 10 API and SQL Server schema migrations live in `backend/` and `database/`. The public site records Firebase Analytics page views and sends contact inquiries to the API when configured. The backend has ASP.NET Core Identity, email confirmation, bearer authentication, persisted roles, organization memberships, and membership-verified organization context. Tenant-owned CRM and client/admin workflows remain **unimplemented** until their data queries enforce that context. Supabase Postgres remains an optional API health-checked connection.

## Repository structure

```text
public/            React public website (owns src/styles/tailwind-theme.css)
dashboard/         Angular dashboard (owns matching src/styles/tailwind-theme.css)
backend/           .NET Clean Architecture solution
database/          SQL Server migration guidance and database operations
devops/            Deployment, CI/CD, containers, and infrastructure definitions
storage/           Centralized media, static fallback, and Supabase Storage bucket schemas
testing/           Cross-platform end-to-end and integration test suites
ai-agents/         AI feature specifications, evaluations, and gated future workflows
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

## Continuous integration

GitHub Actions runs three independent status checks on every pull request and pushes to `main`: **Public React**, **Angular Dashboard**, and **Backend .NET 10**. The frontend jobs install pnpm 12.14.0 and Node.js 22.22.3, use each app's own `pnpm-lock.yaml`, and run frozen installs before lint/test/build (Angular has no lint script). The backend job reads `global.json`, restores with `--locked-mode`, then builds and tests Release without restoring again. The workflow requires no secrets and has read-only repository permissions, so fork pull requests use the same checks. Make these checks required in repository rulesets as described below.

Run the same checks locally from the repository root:

```powershell
pnpm --dir public install --frozen-lockfile
pnpm --dir public lint
pnpm --dir public test
pnpm --dir public build

pnpm --dir dashboard install --frozen-lockfile
pnpm --dir dashboard test --watch=false
pnpm --dir dashboard build

dotnet restore backend/DigiSay.sln --locked-mode
dotnet build backend/DigiSay.sln --configuration Release --no-restore
dotnet test backend/DigiSay.sln --configuration Release --no-build --no-restore
```

To make these gates mandatory, configure a repository ruleset or branch protection rule for `main`, require pull requests, and require the exact status checks **Public React**, **Angular Dashboard**, and **Backend .NET 10**. Enable “Require branches to be up to date before merging” if the team wants checks to run against the latest base. GitHub repository administrators must save that ruleset; workflow files cannot enable branch protection themselves.

## Architecture documentation

- [System architecture](docs/architecture/SYSTEM-ARCHITECTURE.md)
- [Clean Architecture boundaries](docs/architecture/CLEAN-ARCHITECTURE.md)
- [Domain modules and status](docs/architecture/DOMAIN-MODULES.md)
- [AI engineering roadmap](docs/architecture/AI-ENGINEERING-ROADMAP.md)
- [Database ownership](docs/database/DATABASE-OWNERSHIP.md)
- [API conventions](docs/api/API-CONVENTIONS.md)
- [Security requirements](docs/security/SECURITY-REQUIREMENTS.md)
