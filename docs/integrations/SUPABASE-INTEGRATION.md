# Supabase integration

The API has an optional Npgsql health check for the Supabase Postgres shared session pooler on port 5432. Configure `ConnectionStrings:SupabasePostgres` only through User Secrets or a managed secret store; TLS is required and the client pool is intentionally small. The supplied project string has no database password, so the connection is not verified yet. No Supabase business tables are enabled; SQL Server remains authoritative for business transactions.

## Supabase Storage

Supabase Storage is the authoritative store for binary media blobs, edge CDN delivery, and video streaming.

- **Bucket Definitions & RLS:** Configured in [`storage/supabase/001_storage_buckets.sql`](../../storage/supabase/001_storage_buckets.sql).
- **Public Media (`public-media`):** Publicly readable bucket for showreel videos, marketing images, service banners, and brand assets.
- **Client Assets (`client-assets`):** Private bucket governed by Row Level Security; authenticated clients access files via signed URLs within their tenant/organization folders.
- **Creator Submissions (`creator-submissions`):** Private bucket for influencer network raw video submissions with 1 GB size limit and MIME validation.
- **Cross-Layer Resolvers:**
  - Public React Frontend: `public/src/lib/storage.ts`
  - Angular Dashboard: `dashboard/src/app/core/storage.service.ts`
  - ASP.NET Core Backend: `backend/src/DigiSay.Application/Storage/IStorageService.cs`
