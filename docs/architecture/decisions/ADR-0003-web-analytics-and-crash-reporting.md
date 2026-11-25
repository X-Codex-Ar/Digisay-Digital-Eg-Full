# ADR-0003: Web analytics and crash reporting

**Status:** Proposed
**Date:** 2026-11-25

## Context

The public React site initializes Firebase Analytics in the browser and sends a page-view event after router navigation. Firebase configuration is public client configuration. The dashboard does not initialize Firebase Analytics. The public app also has a small server-side error capture helper that preserves SSR error stacks for its existing log output; it is not a durable crash-reporting service. The API uses the normal ASP.NET logging pipeline and has no configured external telemetry exporter in this scope.

The site privacy text describes Google Analytics and Firebase. At the time of this review, the page-view implementation had no consent state or opt-in gate. This PR adds a technical default-deny gate for Firebase Analytics, but the repository still cannot determine which consent obligations apply to the eventual deployment audience. The product/legal owner must approve the applicable basis, wording, audience, and retention policy before deployment.

## Problem to solve

Decide whether DigiSay should expand Firebase Analytics to the dashboard or add browser crash reporting now, and identify the operational, cost, privacy, and support limits before introducing another telemetry path.

## Firebase capabilities and limits

- **Google Analytics for Firebase** supports web events and user properties. The public site currently uses it only for page views. Expanding event collection requires an event taxonomy, data minimization, retention/access ownership, and a consent decision. Analytics must not receive secrets or sensitive business content.
- **Crashlytics for Web** can report JavaScript and TypeScript errors through the Firebase JavaScript SDK. The web offering is currently a Preview with no SLA or deprecation protection. Its documented setup requires the Blaze plan and uses Cloud Logging, Error Reporting, and Cloud Storage for telemetry and source maps. This carries cost and operational dependencies, and the project must decide whether Preview support is acceptable before enabling it.
- Firebase configuration in a browser is public. It is not a place for Admin credentials or server secrets.

## Alternatives and tradeoffs

| Option | Benefits | Limits and costs |
| --- | --- | --- |
| Keep Firebase Analytics limited to public-site page views | Reuses the existing SDK and avoids duplicating analytics properties across internal dashboard screens. | Does not provide API/dashboard business telemetry or crash reports. The existing implementation has no consent gate; deployment policy needs review. |
| Add Firebase Crashlytics for Web | Integrates with the Firebase project and groups browser errors; supports JS/TS web apps. | Preview support without SLA; Blaze plan and Cloud Logging/Storage dependency; source maps must be uploaded and protected; browser telemetry still needs consent, minimization, and retention decisions. |
| Keep existing backend ILogger/console output | No new provider or credentials; useful for local diagnosis and server logs. | Not a browser crash reporter, and by itself it does not provide centralized retention, alerting, or cross-instance aggregation. The hosting environment must own log collection. |
| Add a separate error-monitoring provider such as Sentry or an OpenTelemetry pipeline | Could give supported browser and backend error/performance telemetry with configurable export. | No such provider is currently configured. It adds SDKs, endpoints, source-map handling, data processing review, retention controls, and operating cost. Supabase Storage/Realtime does not replace a telemetry backend. |

## Decision

Keep Firebase Analytics restricted to the existing public-site page views. Do not add dashboard/user analytics or Crashlytics in this phase. Do not send business data or user identifiers to Firebase. Keep the API and SSR error output on their existing logging paths while deployment logging and alerting are evaluated separately.

Reopen the Crashlytics choice when the owner confirms that the Firebase project's Blaze billing and Preview status are acceptable, approves the privacy/consent and retention policy, and assigns ownership for source-map upload and production alert response. If Preview is not acceptable, compare a supported error-monitoring or OpenTelemetry setup against the hosting provider's logging capabilities.

## Reviewer decisions

- Confirm the legal basis, consent wording, target audiences, and retention policy for public-site Analytics. This PR defaults to no collection until explicit opt-in; that technical behavior does not replace legal/privacy approval.
- Confirm whether Crashlytics Web Preview and Blaze billing are acceptable for a future pilot.
- Identify who owns telemetry retention, source maps, and production alerts before enabling client-side error reporting.

## Configuration and risks

No new environment variables, secrets, Firebase products, SDK dependencies, or production settings are required by this decision. The public Firebase web config remains client-visible and its API key should stay restricted by allowed APIs/referrers. This PR implements a versioned browser-local Analytics preference with default-deny behavior, explicit Allow/Reject choices, a persistent Privacy settings entry point, and Firebase Analytics consent updates on grant/revocation. Page-view events are not initialized or sent unless the stored choice is explicitly granted. This technical gate does not establish the legal basis, prove visitor identity, or define retention; those remain owner decisions. The absence of centralized alerting for API/SSR errors also remains open.

## References

- [Firebase Analytics for Web](https://firebase.google.com/docs/analytics/web/get-started)
- [Firebase Crashlytics for Web setup](https://firebase.google.com/docs/crashlytics/web/get-started)
- [Firebase Crashlytics Web troubleshooting and FAQ](https://firebase.google.com/docs/crashlytics/troubleshooting)


## Consent gate behavior and operational limits

- A first-time or unknown visitor is treated as denied. Firebase Analytics is not initialized and no page-view event is sent until the visitor explicitly selects Allow analytics.
- Reject optional analytics stores a denied preference. The visitor can reopen Privacy settings and change the choice later; revocation updates Firebase consent to denied and prevents subsequent page-view events.
- The preference is stored in versioned browser local storage. It is a client-side preference, not an authenticated identity record or proof of legal consent; clearing browser storage returns the visitor to the default-deny prompt.
- Only the existing public-site page-view event remains in scope. Do not add user IDs, business records, form values, query strings, or other sensitive/personal fields to Analytics.
- Banner copy, legal basis, consent requirements by deployment audience, retention, and data-subject workflow still require approval by the responsible privacy/legal owner before production rollout.
- Crashlytics, dashboard analytics, new telemetry providers, and source-map upload remain out of scope.
