# SQL Server schema

Use the EF Core migrations in `backend/src/DigiSay.Infrastructure/Persistence/Migrations` for new schema changes. Apply them explicitly with `dotnet ef database update` after review. The API intentionally does not call `EnsureCreated`, auto-migrate, or mutate production schemas at startup. `001_contact_inquiries.sql` is retained for legacy/manual deployments; the initial EF migration handles a database where that script has already run.

`ContactInquiries` stores only fields submitted through the public contact form plus a UTC creation time and source IP for abuse investigation. Restrict access to authorized operations staff, avoid copying inquiry text into logs, and delete or anonymize records after 180 days unless a documented legal or business need requires a different period.
