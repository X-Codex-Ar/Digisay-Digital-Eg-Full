# Service-request triage foundation

This phase establishes a provider-neutral Application contract and output validation for future staff-reviewed service-request triage. It is not a live AI feature: no provider implementation, endpoint, background worker, dashboard control, or provider credential is registered. Existing CRM behavior is unchanged, and no request data leaves the API.

## Contract boundaries

- The use case loads the service request using the verified organization ID from `IOrganizationContext`; it never trusts a tenant ID supplied by a client.
- The model input contains only the request service, title, and description. It excludes organization IDs, user IDs, email addresses, and other CRM fields.
- `IServiceRequestTriageDataMinimizer` must be implemented and tested before any provider is wired. Free text can still contain personal or confidential data after automated redaction, so minimization alone is not approval to transmit it.
- `IServiceRequestTriageProvider` is a backend-only port. Model output is untrusted and must pass `ServiceRequestTriageOutputValidator` before it can reach a client.
- Every returned suggestion sets `RequiresHumanReview`; the use case cannot modify request status or send messages.

## Activation gates

Do not register a provider or expose an endpoint until the product owner confirms the exact service taxonomy and urgency semantics, and security/privacy owners approve provider, deployment region, retention/training terms, data minimization, evaluation threshold, and operator controls. The first live adapter must include provider/model/prompt provenance from trusted configuration, bounded cost and timeouts, safe failure behavior, audit events for accept/edit/reject, and tenant-isolation tests.

## Validation

Run the focused Application tests from the repository root:

```powershell
dotnet test backend/tests/DigiSay.Application.Tests/DigiSay.Application.Tests.csproj --configuration Release
```

Tests use synthetic service-request records and fake minimizer/provider implementations. No network inference is performed.
