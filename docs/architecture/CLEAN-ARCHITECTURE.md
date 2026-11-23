# Clean Architecture boundaries

The backend solution is split into four projects. Domain has no project/package references. Application depends on Domain. Infrastructure implements external and persistence concerns and depends inward on Application. API is the composition root and depends on Infrastructure.

```text
DigiSay.Api -> DigiSay.Infrastructure -> DigiSay.Application -> DigiSay.Domain
```

The API contains a `ContactInquiry` domain entity, an Application writer boundary, SQL Server persistence in Infrastructure, and versioned minimal API endpoints. The optional Supabase adapter is limited to connectivity health. Controllers are not present. Avoid adding generic repositories until a concrete use case demonstrates the need.
