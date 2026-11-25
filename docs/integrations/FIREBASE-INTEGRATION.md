# Firebase integration

## Current use

The public React app initializes the Firebase web app and sends page-view events to Firebase Analytics when the browser supports analytics. This is public web configuration. Firebase Auth, Firestore, FCM, and Firebase Admin are not currently integrated. SQL Server remains the authority for business data.

## Proposal: optional push delivery through FCM

If product requirements approve push notifications, use Firebase Cloud Messaging (FCM) only as a downstream delivery channel behind the existing SQL Server outbox. Do not move the outbox, notification history, user/device ownership, preferences, or delivery state to Firebase. A future in-app notification feed should be SQL-owned and tenant-scoped; Firestore is not proposed.

Proposed flow:

1. A SQL business transaction writes its domain change and a minimal `notification.delivery-requested.v1` outbox record atomically.
2. A backend FCM adapter consumes that outbox record idempotently and sends a minimal payload to the recipient's registered FCM installation.
3. FCM acceptance is recorded as a delivery attempt only. The authoritative notification remains in SQL, and clients fetch it through the authenticated API. FCM acceptance does not prove device delivery or display.
4. FCM installation identifiers/tokens and their user ownership are stored and revoked in SQL. Tenant and user recipients are resolved by the backend from verified Identity/membership data; clients cannot choose an organization or another user's token.

Keep notification payloads free of personal, CRM, or other sensitive content. Send an opaque SQL notification ID and event type, then have the authenticated client fetch authorized details from the API. Use stable event IDs for idempotency, bounded retries, stale-token cleanup, and operational dead-letter review. Do not use broad topic subscriptions for tenant-private notifications.

Before implementation, confirm that web push is a product requirement, define the supported clients and notification preferences, and assign dashboard/public client integration to the frontend owner. The backend would need a server-side FCM sender using managed workload identity or other managed Google credentials; no service-account JSON or key belongs in Git. Proposed setting names only: `Firebase:ProjectId` and the deployment's Google workload-identity/credential binding. No Firebase project values or credentials are recorded here.

The notification module is currently unimplemented. This proposal does not enable FCM, Firebase Admin, Firestore, or Firebase Auth. Firebase's official guidance states that FCM is sent from a trusted server and that a successful send response only means FCM accepted the request, not that the device received it: [FCM server environment](https://firebase.google.com/docs/cloud-messaging/server-environment), [message lifespan and delivery](https://firebase.google.com/docs/cloud-messaging/customize-messages/setting-message-lifespan). If approved, scope implementation and client work as separate reviewed changes after this proposal.
