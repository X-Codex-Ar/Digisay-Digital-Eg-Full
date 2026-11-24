# DigiSay Quality Assurance & Testing

Backend unit and API integration tests live beside the backend under `backend/tests/`. This folder is reserved for platform-wide end-to-end (E2E) testing, cross-application integration validation, load testing, and automated quality gates.

## Scope & Purpose

- **Cross-App E2E Testing:** Automated user journeys spanning the React public site (`public`), the Angular client/admin portals (`dashboard`), and the ASP.NET Core API (`backend`).
- **Integration Test Suites:** End-to-end verification of critical paths (e.g. contact inquiry submission from public frontend to backend API and database storage).
- **Performance & Load Testing:** Benchmarking API response times, throughput, and rate-limiting enforcement under heavy traffic (e.g. using k6 or Artillery).
- **Security & Compliance Audits:** Automated vulnerability scanning, SAST/DAST checks, and dependency audit verification.

## Inner-App Testing vs. Platform Testing

The repository maintains strict testing responsibilities across its architectural boundaries:

| Layer | Responsibility | Framework | Run Command |
| :--- | :--- | :--- | :--- |
| **`public/`** | Public React frontend unit and component tests, routing checks, form validation | Vitest & React Testing Library | `pnpm --dir public test` |
| **`dashboard/`** | Angular administration and client portal routing and component tests | Vitest & Angular Testing Suite | `pnpm --dir dashboard test` |
| **`backend/`** | ASP.NET Core domain logic, validation, API endpoint, and persistence tests | xUnit / .NET Test | `dotnet test backend/DigiSay.sln` |
| **`testing/`** | System-wide E2E scenarios, multi-app integration, and load tests | Playwright / Cypress / k6 | Reserved for next phase |

## Backend test projects

All backend test projects are included in `backend/DigiSay.sln` and use xUnit:

| Project | Coverage | Maintainers |
| --- | --- | --- |
| `DigiSay.Domain.Tests` | Entity invariants and lifecycle rules | dev-saffo, eng-loola |
| `DigiSay.Application.Tests` | Use-case behavior with in-process fakes | dev-saffo, eng-loola |
| `DigiSay.Infrastructure.Tests` | Persistence mappings, architecture boundaries, and adapters | dev-saffo, eng-loola |
| `DigiSay.API.IntegrationTests` | HTTP contracts, Identity, tenant isolation, and persisted workflows | dev-saffo, eng-loola |

## Prerequisites and commands

- Install the .NET 10 SDK selected by the repository `global.json`.
- Run commands below from the repository root. API integration tests need a disposable SQL Server instance; tests replace Redis, SMTP, and Supabase integrations with deterministic fakes.
- Restore locked dependencies once before running with `--no-restore`:

```powershell
dotnet restore backend/DigiSay.sln --locked-mode
```

Run all backend suites:

```powershell
dotnet test backend/DigiSay.sln --configuration Release
```

Run a focused project or class:

```powershell
dotnet test backend/tests/DigiSay.Domain.Tests/DigiSay.Domain.Tests.csproj --filter FullyQualifiedName~CrmLifecycleTests
dotnet test backend/tests/DigiSay.Application.Tests/DigiSay.Application.Tests.csproj --filter FullyQualifiedName~LeadUseCaseTests
dotnet test backend/tests/DigiSay.Infrastructure.Tests/DigiSay.Infrastructure.Tests.csproj --filter FullyQualifiedName~PersistenceModelTests
dotnet test backend/tests/DigiSay.API.IntegrationTests/DigiSay.API.IntegrationTests.csproj --filter FullyQualifiedName~CrmLifecycleApiTests
dotnet test backend/tests/DigiSay.API.IntegrationTests/DigiSay.API.IntegrationTests.csproj --filter FullyQualifiedName~IdentityApiTests
```

Set `TEST_SQLSERVER_CONNECTION_STRING` to a disposable SQL Server instance where the test user can create databases. The API integration factory creates a uniquely named database per factory and replaces email, storage, and rate-limit dependencies with deterministic fakes. The factory sets the test connection configuration before the API starts and drops its database when disposed. Never point the test connection at production or at a database containing user data. The infrastructure model tests configure the SQL Server provider without opening a database connection.

GitHub Actions restores in locked mode, builds Release, then runs the full solution without restoring again. From the repository root, `pnpm run test:api` is also available for the complete backend suite.

## Roles & Developer Responsibilities

### QA / Test Automation Lead
- Design and maintain end-to-end test scenarios covering critical business funnels.
- Define mock strategies for external services (Firebase, Supabase, SMTP providers) to ensure deterministic test runs.
- Integrate platform-wide test suites into the continuous integration pipeline in `devops/`.

### Application Developers
- Maintain high unit and integration test coverage within individual app folders prior to submitting changes.
- Ensure all tests pass locally (`pnpm run test:all`) before pushing to remote branches.
