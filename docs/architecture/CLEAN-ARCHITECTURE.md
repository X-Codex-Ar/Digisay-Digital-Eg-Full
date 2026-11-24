# Clean Architecture boundaries

The backend solution uses four layers with inward dependencies. Domain has no project/package references. Application contains common application services, contracts, and feature use cases and depends on Domain. Infrastructure implements persistence, identity, storage, and external integrations and depends inward on Application. API is the composition root and exposes transport endpoints.

```text
DigiSay.API -> DigiSay.Infrastructure -> DigiSay.Application -> DigiSay.Domain
```

Domain types live under `DigiSay.Domain/Entities`, with shared abstractions, enums, exceptions, and value objects in their own folders. Application code is grouped by feature; CRM commands, queries, handlers, and persistence contracts are separated by use case. Infrastructure keeps EF Core configuration, context, migrations, and SQL-backed stores under `Persistence`, Identity types under `Identity`, and Supabase connectivity checks under `Integrations`. API request/response models and route mapping stay in Minimal API endpoint modules under `Endpoints`; there are no MVC controllers. Tests are divided by Domain, Application, Infrastructure, and API integration boundary. Add folders for future capabilities when they contain real code, and avoid generic repositories or empty layers without a concrete use case.
