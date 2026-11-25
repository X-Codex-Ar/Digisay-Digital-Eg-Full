# System Architecture

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Clean%20Architecture-512BD4?style=flat-square" alt="Clean Architecture" />
  <img src="https://img.shields.io/badge/Database-SQL%20Server%202022-CC292B?style=flat-square" alt="SQL Server" />
  <img src="https://img.shields.io/badge/Multi--Tenant-Isolated-2ea44f?style=flat-square" alt="Multi-Tenant" />
</p>

---

## ✦ System Topology & Data Flow

DigiSay is architected as an independently deployable frontend monorepo paired with a robust ASP.NET Core 10 modular-monolith backend:

```mermaid
flowchart TD
    subgraph Clients["Frontend Applications"]
        ReactApp["Public Website\n(React 19 + TanStack Start)\nSSR / Port 8080"]
        AngularApp["Client & Admin Dashboard\n(Angular 22.3)\nSPA / Port 4200"]
    end

    subgraph Gateway["Ingress & Transport"]
        ReverseProxy["Reverse Proxy / Cloudflare\nForwarded Headers Filter"]
    end

    subgraph API["ASP.NET Core 10 Modular Monolith"]
        Middleware["API Pipeline\n• Rate Limiting (Redis HMAC)\n• Security Headers & CORS\n• Auth & Session Revocation\n• Tenant Context (IOrganizationContext)"]
        Endpoints["Minimal API Endpoints\n• /api/v1/auth\n• /api/v1/organizations\n• /api/v1/crm\n• /api/v1/storage\n• /api/v1/contact-inquiries"]
        AppLayer["Application Layer\nCommands, Queries, Invariants, DTOs"]
        InfraLayer["Infrastructure Layer\nEF Core 10, Supabase Adapter, Redis"]
    end

    subgraph Data["Persistence & Providers"]
        SqlServer[("Microsoft SQL Server 2022\nPrimary System of Record\n• Identity & Roles\n• Organizations & Members\n• CRM Leads & Follow-ups\n• Storage Object Metadata")]
        RedisStore[("Redis 7 (Fixed-Window)\nAtomic Rate Limiting")]
        SupabaseStore["Supabase Private Storage\n5-Minute Signed URLs"]
    end

    Clients --> ReverseProxy
    ReverseProxy --> Middleware
    Middleware --> Endpoints
    Endpoints --> AppLayer
    AppLayer --> InfraLayer
    InfraLayer --> SqlServer
    InfraLayer --> RedisStore
    InfraLayer --> SupabaseStore
```

---

## ✦ Security & Multi-Tenant Boundaries

1. **Authentication & Session Security:**
   - Identity authority resides exclusively in ASP.NET Core Identity on SQL Server.
   - 15-minute bearer tokens in memory, 7-day rotating refresh tokens.
   - Instant session revocation via `SecurityStamp` rotation; refresh reuse is detected and blocked.
2. **Tenant Context Enforcement:**
   - Every tenant-scoped request requires an `X-Organization-Id` header.
   - `IOrganizationContext` validates that the authenticated caller has an active membership in the requested organization.
   - Cross-tenant queries return HTTP 404 to avoid leaking tenant existence.
3. **Distributed Rate Limiting:**
   - Powered by Redis Lua scripts implementing fixed-window sliding counters.
   - Client IPs/UserIds are hashed using HMAC-SHA256 with a private salt before reaching Redis.
4. **Binary Asset Protection:**
   - Uploads require organization owner roles, validated file signatures (magic bytes for PDF, PNG, JPEG), and a 10MB limit.
   - Downloads use short-lived (5-minute) signed URLs generated server-side.
