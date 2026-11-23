# DigiSay Quality Assurance & Testing

This folder is reserved for platform-wide end-to-end (E2E) testing, cross-application integration validation, load testing, and automated quality gates.

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

## Roles & Developer Responsibilities

### QA / Test Automation Lead
- Design and maintain end-to-end test scenarios covering critical business funnels.
- Define mock strategies for external services (Firebase, Supabase, SMTP providers) to ensure deterministic test runs.
- Integrate platform-wide test suites into the continuous integration pipeline in `devops/`.

### Application Developers
- Maintain high unit and integration test coverage within individual app folders prior to submitting changes.
- Ensure all tests pass locally (`pnpm run test:all`) before pushing to remote branches.
