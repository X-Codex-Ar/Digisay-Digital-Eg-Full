# Domain Modules & Capability Status

The DigiSay platform is structured around clearly separated domain boundaries governed by Clean Architecture:

| Domain Module | Responsibility & Scope | Database Aggregates | Implementation Status |
| :--- | :--- | :--- | :--- |
| **Identity & Access** | User accounts, roles, confirmation, password recovery, session revocation | `AspNetUsers`, `AspNetRoles`, `AspNetUserClaims` |  **Active** (Bearer auth, RBAC, SecurityStamp revocation) |
| **Organizations & Tenancy** | Multi-tenant organization records, memberships, permissions | `Organizations`, `OrganizationMemberships` |  **Active** (`IOrganizationContext`, verified header lookup) |
| **Contact & Inquiries** | Public visitor inquiries, honeypot validation, rate limiting | `ContactInquiries` |  **Active** (Validated, spam-protected, rate-limited) |
| **CRM Leads** | Lead capture, status lifecycle, history tracking, follow-ups | `Leads`, `LeadFollowUps`, `LeadStatusHistories` |  **Active** (RowVersion 409 concurrency, search escaping) |
| **Service Requests** | Client request submissions, scope review, triage | `ServiceRequests`, `ServiceRequestTransitions` |  **Active** (Tenant-isolated, client & admin workflows) |
| **Private Media Storage** | Asset metadata, signed download links, bucket RLS | `StorageObjectRecords` |  **Active** (Magic byte validation, 5-min signed URLs) |
| **Rate Limiting** | Distributed abuse prevention and brute-force mitigation | Redis atomic counters |  **Active** (Redis Lua fixed-window, HMAC-SHA256 salted keys) |
| **Observability & Consent** | Default-deny web analytics, page view tracking | Client `localStorage` preference |  **Active** (PR #36: explicit allow/reject, revoke settings) |
| **AI Roadmap & Triage** | Staff-assisted suggestion workflows and FAQ assistant | Evaluated with synthetic tests |  **Staged in PR #28** (Roadmap, bounded FAQ, safe doubles) |
| **Campaigns & Deliverables**| Project delivery, milestone approval, client visibility | Future phase | ⏳ Planned for Phase 2 |

---

## ✦ Transactional & Consistency Invariants

1. **SQL Server Transaction Boundary:**
   - State mutations (such as transitioning a lead and recording audit history) execute inside a single transactional boundary.
   - Concurrency conflicts throw `DbUpdateConcurrencyException`, translated to `ConcurrencyConflictException` and surfaced as HTTP 409 Conflict.
2. **Provider Separation:**
   - SQL Server holds metadata as source of truth.
   - External binary storage (Supabase) is managed via best-effort compensatory patterns (delete provider object if metadata fails, or preserve metadata until provider deletion succeeds).
