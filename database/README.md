# Database operations

SQL Server is the source of truth for DigiSay business records. Supabase Postgres is an optional separately managed data capability; it is not a mirror of SQL Server. Firebase Analytics is configured in the public React app and is not a business database.

## SQL Server

EF Core migrations in `backend/src/DigiSay.Infrastructure/Persistence/Migrations` are the SQL Server schema source of truth. Review migrations and apply them explicitly with `dotnet ef database update`; the API does not run schema changes automatically at startup. The initial migration detects an existing `ContactInquiries` table created by the legacy `sqlserver/001_contact_inquiries.sql` script and preserves its records. Contact records contain personal data; restrict database access and apply the retention policy documented in `sqlserver/README.md`.

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
