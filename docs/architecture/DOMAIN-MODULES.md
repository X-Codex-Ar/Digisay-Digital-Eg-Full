# Domain modules

Planned modular-monolith capabilities and current status:

| Module | Intended ownership | Status |
| --- | --- | --- |
| Identity and access | Users, roles, email verification, password recovery, SPA bearer authentication | Initial Identity foundation implemented; role administration and session revocation remain open |
| Organizations | Organization records, memberships, active tenant context | Membership-verified context implemented; invitations and administrative membership workflows remain open |
| Client management | Client organizations, contacts, membership | Not implemented; future client records must use verified tenant context and tenant-scoped persistence |
| Service catalog | Service metadata; public copy remains in React today | Not implemented in API |
| Leads and requests | Guest and client inquiries, assignment, history | Tenant-scoped CRM lifecycle endpoints, EF global filters, and transactional outbox events implemented; external projections remain unconfigured |
| Projects and tasks | Delivery, assignments, milestones, client visibility | Not implemented |
| Campaigns and content | Campaign workflow and deliverable metadata | Not implemented |
| Notifications | SQL-owned notification history/preferences; optional FCM push delivery through outbox | Not implemented; FCM is a proposal only in `docs/integrations/FIREBASE-INTEGRATION.md` |
| Support | Tickets, conversations, attachments | Not implemented |
| Audit and reporting | Append-only audit history and aggregates | Not implemented |

Modules will share the SQL Server transaction boundary where business invariants require it. Cross-module reads should use explicit application queries; module ownership and authorization rules must be documented before endpoints are exposed.
