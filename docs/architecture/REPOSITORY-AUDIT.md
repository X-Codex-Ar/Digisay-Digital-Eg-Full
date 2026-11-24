# Repository audit

**Audit date:** 2026-11-24
**Scope:** checked-in source, configuration, scripts, and the existing test setup. Generated output and `node_modules` were excluded.

## Existing architecture

At initial audit the repository was a single-package React website. It has since been moved intact to the repository-root `public/` app: TanStack Start provides server rendering and TanStack Router uses file-based routes in `public/src/routes`; page composition and business content live in `public/src/features`, `public/src/components`, `public/src/data`, and `public/src/types`. Static media is in `public/static` and `public/src/assets`. Shared styles and Tailwind v4 design tokens are in `public/src/styles.css`.

## Current technology stack

- React 19, TanStack Start/Router, TypeScript strict mode, Vite 8.
- Tailwind CSS 4 and Radix-based UI components.
- React Hook Form, Zod, TanStack Query, Motion, and Lucide icons.
- Vitest with jsdom and Testing Library; ESLint and Prettier.
- Public and dashboard dependencies are managed independently with pnpm lockfiles. Root scripts dispatch to the three app folders.
- The ASP.NET Core 10 API and Angular app are present. Backend projects use Central Package Management and lock files, with API contract/use-case modules outside `Program.cs`. ASP.NET Core Identity, SQL persistence, unit, architecture-boundary, and API integration test projects are included. The public React and Angular dashboard apps each keep their Tailwind tokens inside their own app; the two token files are intentionally identical to preserve the DigiSay visual language without a shared root package. SQL Server EF migrations and local environment templates are in `backend/` and `database/`; Docker Compose, CI, and deployment automation are not configured.

## Existing business features

Public routes cover home, about, contact, services, anti-piracy/RightsHero, content management, production, social media, growth marketing, influencer marketing, Iraq content management, privacy policy, and blog listings/details/categories/tags/authors. Brand, navigation, service descriptions, partners, awards, statistics, and blog content are local TypeScript data. Static media lives in `public/static/assets` and `public/src/assets`.

The contact form validates with Zod and a honeypot, then posts to the versioned API when configured. The API validates again, rate-limits by IP, and persists to SQL Server. When the API is unavailable, the React app retains the honest `mailto:` draft and copyable summary fallback. Email sending is not implemented. Tests cover contact validation/fallback and route matching.

## Technical limitations and missing backend functionality

- Client/admin dashboard workflows and tenant-owned protected business APIs are not implemented. Identity authentication and organization membership verification are implemented as foundations; server-side refresh-token revocation and role-management workflows remain open.
- API rate limiting is in-process; use a distributed limiter before scaling multiple API instances.
- Supabase is only an optional PostgreSQL connectivity check. No Supabase schema, Storage workflow, Firebase Auth, Firestore, FCM, or Firebase Admin integration exists.
- No real mail provider, file storage, event/outbox processing, SQL Server-backed automated integration environment, E2E suite, container setup, or CI/CD.
- The dashboard API health check is not an authorization mechanism. Do not expose business data until each resource query uses the verified organization context.

## Required frontend integrations

The public contact form calls the versioned API with an environment-configured origin and keeps its fallback UX. The dashboard calls only the health endpoint. Add typed clients for each business API as its DTO/error contracts are implemented. Keep all SQL, Supabase service, and Firebase Admin credentials out of browser bundles. Use server-enforced resource authorization regardless of client navigation guards.

## Migration strategy

1. Keep the public React app in the repository-root `public/` folder, separate from the root `dashboard/` app. Its static assets are stored in `public/static/`; each app owns its theme at `src/styles/tailwind-theme.css`, with matching token contents maintained in both apps.
2. Maintain the isolated `backend/` solution with Domain, Application, Infrastructure, API, and test projects. SQL Server owns authoritative business transactions.
3. Establish API conventions, configuration validation, health checks, SQL persistence, Identity, and verified organization membership. The contact inquiry, account, and organization-selection workflows are implemented foundations.
4. Add lead/service-request workflows and idempotent email/outbox delivery.
5. Add identity and tenant/resource authorization before exposing client data.
6. Add selected Supabase and Firebase workloads only behind backend interfaces and documented ownership.
7. Expand the client/admin Angular feature routes in `dashboard/`; connect protected data only after API authorization policies exist.
8. Add local containers, CI, and Azure deployment after supported runtime/tooling versions and secrets are available.

## Database ownership and integration contracts

SQL Server is the system of record for contact inquiries and planned transactional business entities. Supabase Postgres is an optional connectivity-only adapter until a named data workflow and secret are provided. Firebase Analytics receives public page views; Firebase does not store business records or act as an identity provider. Future cross-system business events require a SQL transactional outbox with idempotent consumers, bounded retries, and operational visibility.

## Risks

- The backend now targets ASP.NET Core 10 LTS and has centrally managed, locked NuGet dependencies. The .NET 10 SDK is selected by root `global.json`.
- Tenant-owned resource isolation, guest-request claiming, one-time refresh-token rotation, and server-side session revocation need threat modeling and integration tests before any tenant-owned data is exposed.
- SMTP delivery requires deployment credentials and provider verification; durable idempotent mail delivery remains unimplemented.
- The Supabase pooler password was not supplied, so that connection cannot be verified. SQL credentials must remain in User Secrets or managed secrets, never Git.
- Existing motion and SSR behavior must be exercised after API integration, especially around browser-only APIs and reduced-motion preferences.
- The configured `origin` remote matches the requested GitHub repository URL. Push status is tracked in the commit history, not in this architecture audit.

## Phase status

The public app, dashboard shell, API contact persistence, ASP.NET Core Identity foundation, verified organization membership, EF schema migrations, Firebase Analytics page views, backend unit/architecture tests, and SQLite-backed HTTP integration tests are implemented. Tenant-owned business-resource isolation, protected workflows, Supabase data access, SQL Server-backed automated integration infrastructure, production infrastructure, and deployment remain future phases until implemented and verified.
