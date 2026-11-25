# Local development with Docker

Docker Compose runs a local SQL Server, Redis, the API, the public React app, and the Angular dashboard. It does not read .NET User Secrets and does not connect to a remote database.

## Start the full stack

From the repository root:

```powershell
docker compose up --build
```

Compose uses a local-only development password by default. If this machine is shared, create a private `.env` from `.env.example` and change the password before starting. Compose binds service ports to `127.0.0.1`.

| Service | Local URL |
| --- | --- |
| Public site | http://localhost:8080 |
| Dashboard | http://localhost:4200 |
| API | http://localhost:5080 |
| API readiness | http://localhost:5080/health/ready |
| SQL Server | localhost,1433 |

On its first start, the Development API applies the checked-in EF migrations to the Compose SQL Server. This behavior is enabled only by the Compose `Database__ApplyMigrationsOnStartup` setting and the API also checks that the environment is Development. The API persists Data Protection keys in a named local volume. Redis is local to the Compose network.

The public assistant remains disabled. Without Supabase Storage credentials, the API uses its explicit unavailable-storage Development adapter. Development email is logged by the API rather than sent through SMTP.

## Run the .NET test suite

In a second terminal, with the stack running:

```powershell
docker compose --profile test run --rm tests
```

The test container connects only to the Compose SQL Server. The integration test factory creates uniquely named disposable test databases on that local instance; it does not use User Secrets.

## Stop or reset

Stop containers and keep local database data:

```powershell
docker compose down
```

Delete all local Compose data, including the SQL database and Data Protection keys:

```powershell
docker compose down --volumes
```

The volumes command is destructive for this local Docker stack. It does not affect remote databases or User Secrets.

For direct host execution instead of Docker, use the existing `ConnectionStrings:SqlServer` User Secret. Keep that remote credential out of `.env`, Compose, and source control.
