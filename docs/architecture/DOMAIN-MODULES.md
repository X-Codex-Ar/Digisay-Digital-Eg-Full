# Domain modules

Planned modular-monolith capabilities and current status:

| Module | Intended ownership | Status |
| --- | --- | --- |
| Identity and access | Users, roles, email verification, password recovery, SPA bearer authentication | Initial Identity foundation implemented; organization membership and session revocation remain open |
| Client management | Client organizations, contacts, membership | Not implemented |
| Service catalog | Service metadata; public copy remains in React today | Not implemented in API |
| Leads and requests | Guest and client inquiries, assignment, history | Not implemented; current form prepares email drafts |
| Projects and tasks | Delivery, assignments, milestones, client visibility | Not implemented |
| Campaigns and content | Campaign workflow and deliverable metadata | Not implemented |
| Notifications | In-app state and delivery preferences | Not implemented |
| Support | Tickets, conversations, attachments | Not implemented |
| Audit and reporting | Append-only audit history and aggregates | Not implemented |

Modules will share the SQL Server transaction boundary where business invariants require it. Cross-module reads should use explicit application queries; module ownership and authorization rules must be documented before endpoints are exposed.
