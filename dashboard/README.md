# <p align="center">DigiSay Client & Admin Dashboard</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-22.3-DD0031?logo=angular&logoColor=white&style=flat-square" alt="Angular 22" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Role%20Guards-RBAC-blue?style=flat-square" alt="RBAC" />
  <img src="https://img.shields.io/badge/Multi--Tenant-X--Organization--Id-orange?style=flat-square" alt="Multi-Tenant" />
  <img src="https://img.shields.io/badge/Vercel-Configured-black?logo=vercel&logoColor=white&style=flat-square" alt="Vercel" />
</p>

---

## ✦ Overview

The **DigiSay Dashboard** is a enterprise-grade Angular 22 application serving two distinct user personas through dedicated, isolated route hierarchies:
1. **Client Portal (`/client/*`):** Self-service workspace for agency partners and content creators to track campaigns, view assets, and submit/monitor service requests under their verified organization tenant.
2. **Administrative Control Center (`/admin/*`):** Unified management console for DigiSay staff to manage CRM leads, review service requests, monitor platform health, and audit user permissions.

---

## ✦ Key Architectural Features

- **Strict Route & Role Isolation:**
  - Administrative routes are guarded by `SuperAdmin`, `Admin`, or `Manager` roles.
  - Client routes require the `Client` role.
  - Route guards handle navigation UX; the ASP.NET Core API independently enforces role and tenant claims on every call.
- **Multi-Tenant Organization Selector:**
  - Clients select their active organization from `/api/v1/organizations`.
  - Selected organization is passed via `X-Organization-Id` in requests.
  - The API verifies active membership and rejects cross-tenant access with HTTP 404.
- **In-Memory Token Lifecycle:**
  - Short-lived bearer tokens (15 minutes) and refresh tokens (7 days) are held securely in memory.
  - Automatic rotation via `/api/v1/auth/refresh`.
  - Sign-out triggers immediate backend session revocation and clears memory state.
- **Responsive Sticky Layouts & Brand Tokens:**
  - Clean separation of Header and Sidebar components.
  - Sticky navigation and custom slim crimson scrollbars (`#d90a2c`) matching the public showcase.
  - Full support for mobile collapsible sidebars and responsive breakpoints.

---

## ✦ Route Structure

```text
dashboard/src/app/
├── core/                   # Authentication, API interceptors, storage services, guards
├── shared/                 # Reusable UI controls, data tables, modals, badges
├── features/
│   ├── auth/               # Sign-in pages (/admin/sign-in, /client/sign-in)
│   ├── admin/              # Staff management routes
│   │   ├── overview/       # System metrics and quick actions
│   │   ├── leads/          # CRM lead management & lifecycle transitions
│   │   └── requests/       # Service request triage and assignments
│   └── client/             # Partner & creator routes
│       ├── overview/       # Active projects and account summary
│       ├── requests/       # Client service request submission and tracking
│       └── assets/         # Signed URL media library
```

---

## ✦ Development & Scripts

From the repository root:

```powershell
# Start local dev server (http://localhost:4200)
pnpm run dev:dashboard

# Run unit tests
pnpm run test:dashboard

# Build production bundle
pnpm run build:dashboard
```

### Runtime Configuration

`public/runtime-config.js` provides environment configuration without exposing credentials:

```javascript
window.digisayRuntimeConfig = {
  apiBaseUrl: 'http://localhost:5080',
  storageBaseUrl: 'https://<your-supabase-project>.supabase.co/storage/v1/object/public'
};
```

---

## ✦ Vercel Deployment

[`dashboard/vercel.json`](vercel.json) is pre-configured with SPA fallback rewrites (`/(.*)` → `/index.html`) so deep links like `/admin/overview` and `/client/requests` resolve smoothly.

In your Vercel Project Settings:
- **Root Directory:** `dashboard`
- **Framework Preset:** `Other` (or Angular)
- **Build Command:** `pnpm run build`
- **Output Directory:** `dist/digisay-dashboard/browser`
- **Install Command:** `pnpm install`
