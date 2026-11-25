# ADR-0004: Remote configuration and feature flags

**Status:** Proposed
**Date:** 2026-11-25

## Context

The current main branch has no feature-flag provider or remote configuration workflow. The React site reads a small number of public build-time settings through Vite environment variables, while the .NET API uses ASP.NET configuration. No business feature currently requires changing behavior independently of a deployment.

## Problem to solve

Choose whether to add a remote flag service now, and define the safe boundary between public presentation settings and backend business/security decisions.

## Firebase capabilities and limits

- **Remote Config for Web** can fetch and activate parameters at runtime, provide in-app defaults, and target client app instances. Its documented production fetch interval defaults to 12 hours; frequent fetches can be throttled. Parameters delivered to a browser are visible to that user and must not contain secrets or authorize access to business data.
- **Remote Config for server environments** is currently Preview, has no SLA/deprecation protection, and official Admin SDK support lists Node.js, Python, Java, and Go. There is no official .NET Admin SDK path for this feature. A .NET integration would need a custom REST/authentication client or a separately hosted supported SDK, adding service credentials, caching, failure behavior, and operations.
- Remote Config is useful for public UI presentation changes and experiments; it must never be the server's authorization or entitlement gate.

## Alternatives and tradeoffs

| Option | Benefits | Limits and costs |
| --- | --- | --- |
| ASP.NET configuration via appsettings and environment variables | Already part of the .NET host; typed options and deployment-specific overrides need no new dependency. Secrets can stay in User Secrets or the deployment environment. | Changes usually require process restart/redeploy; no targeting, experiment analysis, or console-managed rollout. |
| Vite public environment variables | Already used for public React settings and require no provider SDK. | Build-time only; values are public and changing them requires a new frontend build/deploy. Not a secure flag source. |
| Firebase Remote Config Web | Managed runtime changes for public browser behavior; defaults and fetch/activate lifecycle exist. | Browser-visible values; client SDK only controls the client view, not backend authorization. Fetch/cache timing means updates are not an immediate kill switch. |
| Firebase server Remote Config | Central template and targeting for supported server runtimes. | Preview, no SLA, and no official .NET Admin SDK. A bridge or custom REST auth client adds a service credential and a new outage/cache path to the .NET system. |
| Azure App Configuration / feature management | .NET configuration provider and feature evaluation libraries are available. | Adds a cloud-specific dependency, connection/identity setup, refresh behavior, and operational cost; no current deployment requirement justifies it. |

Supabase is not a feature-flag service in the current repository and should remain responsible for the defined storage scope. SQL Server remains the business source of truth; a flag must not duplicate or override authorization data.

## Decision

Do not add a remote config or feature-flag package now. Use the existing .NET configuration pipeline and environment variables for deployment-time backend settings; use existing Vite environment settings only for public build-time UI values. If a real rollout use case appears, first implement a small server-enforced flag using configuration defaults and explicit tests. Adopt a managed provider only when targeting, runtime updates, or experiments are concrete requirements. Firebase Remote Config remains a candidate for public UI-only switches; do not use its browser result to grant API access. Reconsider server-side Firebase only after its .NET support and Preview status change.

## Reviewer decisions

- Confirm whether a named feature currently needs runtime rollout, user/tenant targeting, or emergency disable without a redeploy.
- If yes, identify the deployment platform and whether its managed configuration/flag service is preferred before selecting a provider.

## Configuration and risks

No new packages, environment variables, secrets, or production settings are required. Existing environment names remain unchanged. Risk: build-time public UI values cannot be changed without a frontend build; any future security-sensitive flag must be enforced by the API, never trusted from the browser.

## References

- [Firebase Remote Config for Web](https://firebase.google.com/docs/remote-config/web/get-started)
- [Firebase Remote Config policies and limits](https://firebase.google.com/docs/remote-config/quotas-limits)
- [Firebase Remote Config in server environments](https://firebase.google.com/docs/remote-config/server)
- [Microsoft .NET feature management](https://learn.microsoft.com/en-us/azure/azure-app-configuration/use-feature-flags-dotnet-core)


## Implementation guardrails for future flags

- Bind backend settings to typed .NET options and validate required values and ranges at startup (for example, with options validation and ValidateOnStart). Fail startup for invalid mandatory configuration rather than silently running with misleading values.
- Give every flag an explicit safe default. Presentation-only flags should default to the least surprising safe UI behavior; security-sensitive or entitlement-related behavior must fail closed and be enforced by the API.
- Treat missing, malformed, stale, or unavailable provider values deterministically. Never interpret an unknown value as enabled, and never let a provider outage grant access or bypass a server policy.
- Keep browser-visible Vite values limited to public presentation configuration. A client flag may hide or show UI, but every protected operation must still be authorized by the backend.
- Separate configuration binding/validation from feature evaluation behind a small application-facing abstraction only when a real use case exists; do not introduce a generic flag framework prematurely.
- Add tests for missing values, invalid values, defaults, provider/configuration failure, and attempts to invoke a disabled or unauthorized feature directly through the API.
- If runtime refresh or emergency disable becomes a requirement, define cache lifetime, refresh failure behavior, propagation bounds, and operational ownership. Do not describe build-time Vite values or cached Remote Config as an immediate kill switch.

These guardrails do not change the current decision: no provider or flag package is needed until a named rollout requirement is approved.
