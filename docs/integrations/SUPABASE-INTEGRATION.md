# Supabase integration

The API has an optional Npgsql health check for the Supabase Postgres shared session pooler on port 5432. Configure `ConnectionStrings:SupabasePostgres` only through User Secrets or a managed secret store; TLS is required and the client pool is intentionally small. No Supabase business tables are enabled; SQL Server remains authoritative for business transactions. Any future cross-store projection must be driven by the SQL Server outbox.

## Supabase Storage

Supabase Storage is the authoritative store for binary media blobs, edge CDN delivery, and video streaming.

- **Bucket Definitions & RLS:** Configured in [`storage/supabase/001_storage_buckets.sql`](../../storage/supabase/001_storage_buckets.sql).
- **Private API bucket (`digisay-private`):** Provisioned as a private 10 MiB bucket accepting PDF, JPEG, and PNG. The backend derives object paths as `organizations/{organization-guid-N}/{object-guid-N}`.
- **Access boundary:** The API calls Supabase Storage with a server-only secret key, which bypasses Storage RLS. Browser clients receive no direct access; the API verifies active organization membership on every operation and derives every path from the verified server context. The provisioning policy documents the exact path shape for service-role operations but is not a substitute for API authorization.
- **Public Media (`public-media`):** Publicly readable bucket for showreel videos, marketing images, service banners, and brand assets.
- **Client Assets (`client-assets`):** Separate legacy/private bucket definition; it is not used by the backend API adapter.
- **Creator Submissions (`creator-submissions`):** Private bucket for influencer network raw video submissions with 1 GB size limit and MIME validation.
- **Backend contract:** `backend/src/DigiSay.Application/Features/Content/Abstractions/IPrivateObjectStorage.cs` is the private-object boundary. The backend validates PDF/JPEG/PNG signatures, enforces the 10 MiB limit, derives tenant paths, and issues five-minute signed download links. Adapter expiry validation is bounded to one second through one hour.

The CRM outbox is implemented in SQL Server. No Supabase Realtime channels or tokens are configured. If chat or notifications are approved, first document tenant-scoped channel authorization and backend-issued tokens here as a proposal; do not enable Realtime directly from a client.

For provider access behavior, see [Supabase API key security](https://supabase.com/docs/guides/getting-started/api-keys) and [Storage access control](https://supabase.com/docs/guides/storage/security/access-control). Secret keys use the elevated `service_role` and bypass Storage RLS, so only API-side authorization protects this bucket.
