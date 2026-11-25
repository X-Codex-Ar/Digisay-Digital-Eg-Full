# ADR-0001: Push notifications

- **Status:** Proposed; product decisions are still required before implementation.
- **Date:** 2026-11-25

## Need

The dashboard has placeholder Notifications pages, but the current `main` branch has no notification records, event triggers, delivery preferences, device registration, FCM/Admin SDK, transactional outbox, or background delivery worker. Push would be useful for time-sensitive CRM assignment or status changes while a user is away from the dashboard, but those events and recipients have not been approved yet.

SQL Server remains the business system of record. Firebase currently provides public-site Analytics only; Firebase Auth, Firestore, FCM, and the Admin SDK are not configured in the repository. Supabase is reserved for storage and optional connectivity checks, and it does not own the SQL Server business state.

## Firebase capability and boundary

Firebase Cloud Messaging (FCM) can deliver browser push messages. Web clients need HTTPS, an FCM service worker, browser notification permission, and an installation identifier. The backend can send through the Firebase Admin .NET SDK using Application Default Credentials or a server credential. The FCM HTTP v1 API must be enabled for the Firebase project.

Use Firebase Installation IDs (FIDs) for new web registrations. Firebase's current Admin .NET release notes mark the legacy registration-token properties deprecated and add FID send support. FCM is a delivery channel only: it is not the durable notification inbox, business event store, user directory, or authorization authority. Push payloads should contain a notification ID and safe routing metadata; clients fetch the authorized notification details from the API.

**Limits and trade-offs:** FCM web requires HTTPS and explicit browser permission, and cannot reach a user who has disabled notifications or is offline beyond the provider's delivery behavior. FCM delivery is not a durable business record or an exactly-once guarantee. The server SDK supports batches of up to 500 destinations per multicast request, so larger fan-out requires batching and retry handling. A Firebase service credential creates a privileged server-side secret that must stay in User Secrets or the deployment secret manager; the existing public Firebase web config is not sufficient for sending.

References: [FCM web setup and requirements](https://firebase.google.com/docs/cloud-messaging/web/get-started), [Admin SDK send API](https://firebase.google.com/docs/cloud-messaging/send/admin-sdk), and [Firebase Admin .NET release notes](https://firebase.google.com/support/release-notes/admin/dotnet).

## Alternatives

| Option                                                        | Fit for DigiSay                                                                                                          | Boundaries and trade-offs                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **FCM (recommended delivery provider)**                       | Delivers opt-in web push to supported browsers while the dashboard is in the background. A .NET Admin SDK is available.  | Requires client service-worker/permission work and a server credential; delivery must be retried and tracked separately from the durable inbox.                                                                                                                                                     |
| **SQL Server + backend outbox and worker**                    | Required foundation for durable notification state, recipient authorization, retries, idempotency, and delivery history. | Does not deliver browser push by itself. A worker adds deployment and operations work; add it when a concrete notification event is approved.                                                                                                                                                       |
| **Supabase Realtime Broadcast / Postgres Changes / Presence** | Could update an already-open UI in real time if the product later needs online presence or live dashboard refresh.       | WebSocket delivery does not notify a closed/offline browser. Postgres Changes observes Postgres; mirroring SQL Server business rows into Supabase would create duplicate state and drift risk. Broadcast would need explicit topic authorization and still would not replace the durable SQL inbox. |
| **Existing SMTP email sender**                                | Useful for account lifecycle and possibly an email channel for selected notices.                                         | Email is not browser push or an in-app inbox; delivery is asynchronous and currently lacks an event outbox and user notification preferences.                                                                                                                                                       |
| **Self-hosted Web Push (VAPID)**                              | Avoids FCM and keeps delivery under DigiSay control.                                                                     | Still needs HTTPS, a service worker, permission handling, endpoint/key storage, send/retry operations, and more maintenance. It provides no current product advantage over FCM.                                                                                                                     |
| **Polling the API**                                           | Simple fallback for refreshing an open notifications page.                                                               | Repeated requests add load and latency, and cannot notify a closed tab. The existing dashboard health poll is not a notifications system.                                                                                                                                                           |

Supabase Realtime is not selected for push: SQL Server is authoritative, and realtime changes are useful only while a client is connected. If a future live CRM screen needs it, evaluate authorized Broadcast first; do not copy business tables into Postgres just to subscribe to their changes.

## Recommendation

When product owners select notification events and recipients, use **SQL Server as the durable inbox and outbox**, with a hosted .NET worker delivering eligible web pushes through **Firebase Cloud Messaging**. Keep notification preference, device/FID ownership, opt-in, revocation, attempts, and delivery outcome in SQL Server. Resolve recipients from the authenticated API identity and tenant rules; never accept a client-provided organization ID as authority. Delete invalid FIDs and make delivery idempotent. Keep messages minimal and fetch full details through the authenticated API.

Do **not** add Firebase Admin credentials, an FCM package, endpoint registration, or a worker in this decision PR. Without an approved event, recipient audience, consent flow, and retention rule, those pieces would have no complete behavior to deliver. This defers only the transport implementation; FCM remains the recommended provider once those product gates are decided.

## Decisions required before implementation

1. Which events should notify users first (for example, new assignment or status change), and which are explicitly excluded?
2. Which roles receive each event: staff, client, or both? How is tenant membership checked for each recipient?
3. Is browser push opt-in only? Should permission be requested from a user action, and should sign-out revoke the current installation?
4. What are the notification inbox and delivery-attempt retention periods? Should selected events also fall back to email?
5. Which Firebase project should send messages, and where will its server credential or workload identity be configured?

## Future configuration

No variables are needed for this decision PR. A later FCM implementation will need a Firebase project ID, public VAPID key in the relevant web client's runtime configuration, and server-side Application Default Credentials or a service-account credential held in User Secrets or the deployment secret manager. No credential belongs in source control, a frontend bundle, Docker image, or Compose file.
