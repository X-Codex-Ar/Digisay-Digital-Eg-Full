# DigiSay Client and Admin Dashboard

This Angular 22.3 workspace provides separate client and administration route trees, layouts, navigation, responsive design tokens, and lazy-loaded page areas. The administration routes include authenticated lead and service request workflows backed by the CRM API. The client portal keeps its own route boundary and does not inherit admin access.

## Development server

From the repository root, install workspace dependencies once with pnpm, then run:

```bash
pnpm run dev:dashboard
```

Open `http://localhost:4200/`. `/client` and `/admin` have separate route guards, layouts, and navigation. Admins sign in at `/admin/sign-in` with the `SuperAdmin`, `Admin`, or `Manager` role; clients use `/client/sign-in` with the `Client` role. Both audiences also need active organization membership. Access and refresh tokens stay in memory, refresh tokens rotate after use, and sign out calls the backend session-revocation endpoint while clearing local state immediately.

The client journey is: sign in, load `/api/v1/users/me` and `/api/v1/organizations`, select an organization, then view or submit service requests. Calls to `GET /api/v1/crm/service-requests` and `POST /api/v1/crm/service-requests` send the bearer token and `X-Organization-Id`. The API returns paged records and verifies membership on every request; records outside that organization return 404. Client routes expose no admin review or lifecycle actions, and the API requires an admin role for those operations regardless of the route guard.

The overview checks API readiness using `public/runtime-config.js`. Set its `apiBaseUrl` to the API origin for each deployment; do not put credentials or secret keys in this browser-visible file. The default points to `http://localhost:5080` for local development.

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
