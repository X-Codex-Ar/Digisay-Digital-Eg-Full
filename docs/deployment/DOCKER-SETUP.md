# Local containers

Docker and Compose are not configured yet. The API targets ASP.NET Core 10, requires a reachable SQL Server connection string, and optionally checks Supabase Postgres. Firebase Analytics runs in the public browser app. Container work must use the .NET 10 runtime and must not embed production secrets in images or Compose files. Persistent volumes and non-production credentials must be documented before containers are declared ready.
