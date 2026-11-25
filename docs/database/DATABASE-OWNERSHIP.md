# Database ownership

| Store | Authoritative responsibility | Current status |
| --- | --- | --- |
| SQL Server | Contact inquiries, Identity, organizations/memberships, CRM leads/service requests, and transactional outbox; planned projects, campaigns, invoices, support, and audit | EF Core migrations define the schema; CRM reads use explicit predicates and global filters bound to verified request context |
| Supabase PostgreSQL/Storage | Optional Postgres connectivity; private binary objects only in Supabase Storage | Optional TLS health check and private Storage adapter are implemented; SQL Server remains authoritative for business records and outbox events |
| Firebase Analytics | Public site page views only | Web SDK configured in the React app |

An entity has one authoritative owner. Do not write a SQL-owned business entity to another store as a second source of truth. Keep provider credentials on the server. Future cross-store projections must consume the transactional outbox in SQL Server; distributed ACID transactions are out of scope. The current outbox publisher is a local logging sink and there is no external projection consumer.
