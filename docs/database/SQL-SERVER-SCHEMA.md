# SQL Server schema

The first persisted workflow is public contact inquiries. `DigiSayDbContext` maps that aggregate and the reviewed, repeat-safe SQL script lives at `database/sqlserver/001_contact_inquiries.sql`. Planned transactional aggregates still include organizations/memberships, leads and service requests, projects/tasks/campaigns, support tickets, audit entries, and outbox messages. Define tenant keys, foreign keys, uniqueness, indexes, concurrency behavior, and retention per aggregate before exposing its API.

The current schema is delivered as an explicit SQL script; no migration is run automatically. Future schema changes should use reviewed EF Core migrations with Infrastructure as the migrations assembly and API as startup project. Do not run migrations automatically on API startup in production.
