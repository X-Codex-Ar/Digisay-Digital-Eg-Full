# DigiSay Client and Admin Dashboard

This Angular 22.3 workspace provides separate client and administration route trees, layouts, navigation, responsive design tokens, and lazy-loaded features. Connected pages include authenticated CRM workflows, organization-scoped CRM reports, the admin organization directory, SuperAdmin account and role management, private content/deliverable files, profile display, organization creation/selection, and the public FAQ assistant. The client portal keeps its own route boundary and does not inherit admin access. Project, task, campaign, service-catalog, support, notification, audit-log, and settings routes remain explicit placeholders because their backend domains and APIs do not exist yet; see the integration matrix before treating those sections as usable.

## Development server

From the repository root, install workspace dependencies once with pnpm, then run:

```bash
pnpm run dev:dashboard
```

Open `http://localhost:4200/`. `/client` and `/admin` have separate route guards, layouts, and navigation. Admins sign in at `/admin/sign-in` with the `SuperAdmin`, `Admin`, or `Manager` role; clients use `/client/sign-in` with the `Client` role. Both audiences also need active organization membership. Access and refresh tokens stay in memory, refresh tokens rotate after use, and sign out calls the backend session-revocation endpoint while clearing local state immediately.

The client journey is: sign in, load `/api/v1/users/me` and `/api/v1/organizations`, select an organization, then view or submit service requests. Calls to `GET /api/v1/crm/service-requests` and `POST /api/v1/crm/service-requests` send the bearer token and `X-Organization-Id`. The API returns paged records and verifies membership on every request; records outside that organization return 404. Client routes expose no admin review or lifecycle actions, and the API requires an admin role for those operations regardless of the route guard.

The overview checks API readiness and loads live organization-scoped lead and service-request totals using `public/runtime-config.js`. Set its `apiBaseUrl` to the API origin and `publicBaseUrl` to the public React site origin for each deployment; do not put credentials or secret keys in this browser-visible file. Local defaults point to `http://localhost:5080` and `http://localhost:8080`. The AI assistant uses the API's approved public FAQ endpoint and links to its source pages. Admins can request rate-limited, organization-scoped service-request triage suggestions from CRM details. Suggestions require the server-side OpenAI configuration and always remain human-reviewed; they do not update CRM records.

See [`docs/architecture/DASHBOARD-BACKEND-INTEGRATION.md`](../docs/architecture/DASHBOARD-BACKEND-INTEGRATION.md) for the connected-route matrix and backend work required by the remaining dashboard pages.

## Build and tests

```bash
pnpm run build:dashboard
pnpm run test:dashboard
```

## Vercel Deployment

[`dashboard/vercel.json`](vercel.json) is configured for Vercel. In your Vercel Project Settings:

- **Root Directory:** `dashboard`
- **Framework Preset:** `Other` (or Angular)
- **Build Command:** `pnpm run build`
- **Output Directory:** `dist/digisay-dashboard/browser`
- **Install Command:** `pnpm install`

The `vercel.json` provides SPA fallback rewrites (`/(.*)` → `/index.html`) so deep links like `/admin/overview` and `/client/overview` load without 404 errors.
