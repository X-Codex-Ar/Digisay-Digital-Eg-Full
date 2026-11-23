# DigiSay Client and Admin Dashboard

This Angular 22.3 workspace provides separate client and administration route trees, layouts, navigation, responsive design tokens, and lazy-loaded page areas. The interface shows no fabricated organization, campaign, or project records. API authentication and business endpoints are not implemented yet, so protected data features remain unavailable until those phases are complete.

## Development server

From the repository root, install workspace dependencies once with pnpm, then run:

```bash
pnpm run dev:dashboard
```

Open `http://localhost:4200/`. `/client` and `/admin` have separate route boundaries and navigation. The overview checks API/SQL readiness using `public/runtime-config.js`; replace its `apiBaseUrl` for each deployment. The health check exposes no business data, and route structure does not grant access to protected records.

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
