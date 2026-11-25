# Database operations

SQL Server is the source of truth for DigiSay business records. Supabase Postgres is an optional separately managed data capability; it is not a mirror of SQL Server. Firebase Analytics is configured in the public React app and is not a business database.

## SQL Server

EF Core migrations in `backend/src/DigiSay.Infrastructure/Persistence/Migrations` are the SQL Server schema source of truth. Review migrations and apply them explicitly with `dotnet ef database update`; the API does not run schema changes automatically at startup. The initial migration detects an existing `ContactInquiries` table created by the legacy `sqlserver/001_contact_inquiries.sql` script and preserves its records. Contact records contain personal data; restrict database access and apply the retention policy documented in `sqlserver/README.md`.

Tenant-owned CRM entities (`Lead` and `ServiceRequest`) are filtered by the request-scoped organization context in EF Core. The context is populated only by `VerifiedOrganizationEndpointFilter` after an active membership lookup; CRM stores also retain explicit organization predicates. An unset context has an empty organization identifier, so tenant-owned queries return no rows. Membership resolution intentionally runs before tenant context is set and is constrained by both the selected organization and authenticated user. No system-wide query-filter bypass is currently registered. Integration tests verify direct EF queries as well as API reads across organizations.

The migration order is `20261124054255_IdentityAndRoleSchema`, `20261124062534_OrganizationMemberships`, `20261124070229_CrmLeadAndServiceRequests`, then `20261125110000_TransactionalOutboxAndTenantListIndexes`. The fourth migration creates `integration.OutboxMessages` and changes two CRM list indexes. Its dispatch index matches the worker's ready/lease/occurred-time scan. CRM list indexes begin with `OrganizationId` and then match the actual `CreatedAtUtc DESC, Id` ordering; the previous status/email indexes did not match current list or lookup queries and were removed. Membership's `(UserId, Status)` index supports the active-membership list. No additional speculative indexes are proposed.

Membership's `(OrganizationId, UserId)` primary key permits at most one membership row per user/organization pair, regardless of status, so an additional “one active row” uniqueness constraint would duplicate the existing invariant.

Down migrations for Identity, organizations, CRM, and the outbox can permanently delete user/role, organization/membership, lead/service-request, or pending/delivered event data. The first Identity migration intentionally preserves `ContactInquiries` and its records on rollback. Before reverting any migration that drops data, take and verify a backup, stop writers/dispatchers, and use a reviewed staged restore or export path. These migrations are applied through EF migration history in order; generate idempotent SQL deployment scripts with the EF `--idempotent` option for repeat-safe deployment artifacts. Do not run migrations against a shared or production database without the required release process.

Use ASP.NET User Secrets for local configuration:

```powershell
cd backend/src/DigiSay.Api
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:SqlServer" "<SQL Server connection string>"
```

For deployment, inject `ConnectionStrings__SqlServer` from a managed secret store. Never commit a real connection string.

## Supabase Postgres

Set `ConnectionStrings__SupabasePostgres` only when the database password is available. The backend uses the supplied shared session pooler endpoint on port 5432 with TLS required and a small connection pool. `/health/ready` checks reachability when configured. Supabase credentials are not checked into the repository.

The supplied connection template contains a password placeholder, so Supabase connectivity cannot be verified until the project database password is supplied through User Secrets or deployment secrets. No Supabase schema is applied by this change.
