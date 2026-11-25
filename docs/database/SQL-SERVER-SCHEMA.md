# SQL Server Schema & Migrations

Microsoft SQL Server 2022 is the primary authoritative system of record for all DigiSay business entities.

---

## ✦ Versioned Migrations Matrix

Schema changes are tracked as Entity Framework Core migrations in `backend/src/DigiSay.Infrastructure/Persistence/Migrations/`:

| Migration Identifier | Date | Scope & Tables Introduced |
| :--- | :--- | :--- |
| `20261125120000_InitialIdentityAndOrganizations` | 2026-11-25 | ASP.NET Identity tables, `Organizations`, `OrganizationMemberships`, and `ContactInquiries` |
| `20261125150000_CrmLeadAndServiceRequests` | 2026-11-25 | `Leads`, `LeadFollowUps`, `LeadStatusHistories`, and `ServiceRequests` |
| `20261125190201_CrmConcurrencyRowVersion` | 2026-11-25 | Added `RowVersion` (`rowversion` / `byte[]`) concurrency tokens to `Leads` and `LeadFollowUps` |
| `20261125210540_StorageObjectMetadata` | 2026-11-25 | Added `StorageObjectRecords` for private Supabase Storage tracking |

---

## ✦ Execution Policy

1. **No Automatic Runtime Migrations:**
   The API will **never** execute `context.Database.Migrate()` automatically during startup in production. This prevents race conditions in multi-instance deployments and guarantees that database alterations are subject to change control.
2. **Applying Migrations Deliberately:**
   ```powershell
   dotnet tool install --global dotnet-ef --version 10.0.15
   dotnet ef database update --project backend/src/DigiSay.Infrastructure --startup-project backend/src/DigiSay.API
   ```
3. **Concurrency Control:**
   Entities subject to concurrent modification (such as lead status and follow-up completion) use SQL Server `rowversion` timestamps. The database automatically increments the rowversion on any update, allowing EF Core to detect conflicting concurrent updates without explicit table locking.
