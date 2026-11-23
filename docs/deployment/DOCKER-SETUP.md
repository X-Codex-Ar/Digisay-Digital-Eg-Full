# Local containers

Docker and Compose are not configured yet. The API currently targets ASP.NET Core 9, requires a reachable SQL Server connection string, and optionally checks Supabase Postgres. Firebase Analytics runs in the public browser app. .NET 9 reached end of support on November 10, 2026; production container work should target .NET 10 LTS. Do not embed production secrets in images or Compose files. Persistent volumes and non-production credentials must be documented before containers are declared ready.
