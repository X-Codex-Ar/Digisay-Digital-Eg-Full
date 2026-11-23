# Database ownership

| Store | Authoritative responsibility | Current status |
| --- | --- | --- |
| SQL Server | Contact inquiries now; planned identity, organizations, clients, projects, campaigns, invoices, support, audit, and outbox | SQL provider, readiness check, contact API, and first schema script added; script applied to the configured database |
| Supabase PostgreSQL/Storage | Optional separately owned collaboration/media data after a workflow is defined | Optional TLS health check is implemented; password is still required; no business tables or Storage operations |
| Firebase Analytics | Public site page views only | Web SDK configured in the React app |

An entity has one authoritative owner. Do not write a SQL-owned business entity to another store as a second source of truth. Keep provider credentials on the server. Cross-store projections are asynchronous and will use a transactional outbox in SQL Server; distributed ACID transactions are out of scope.
