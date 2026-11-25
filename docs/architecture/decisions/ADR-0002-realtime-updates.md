# ADR-0002: Realtime updates

- **Status:** Proposed; defer realtime infrastructure until a user-facing need is approved.
- **Date:** 2026-11-25

## Need found on `main`

The current dashboard calls `/health/ready` immediately and every 30 seconds to display API availability. The repository has no business-screen subscription, collaboration/presence flow, chat, or live CRM update requirement. This health indicator is infrastructure status; it does not justify a realtime transport.

SQL Server is the authority for business records. Supabase is not currently the business database and Firebase Realtime Database/Cloud Firestore are not configured.

## Supabase Realtime capability and boundary

Supabase Realtime provides three distinct features:

- **Broadcast:** low-latency transient messages between connected clients or from database triggers, with private channels and authorization policies.
- **Postgres Changes:** subscriptions to `INSERT`, `UPDATE`, and `DELETE` from selected Postgres tables. Supabase recommends Broadcast for scalable, authorized database-change delivery; Postgres Changes is simpler but has scaling limits.
- **Presence:** small, changing connection state such as which users are online. It is not a durable status record and is not intended for high-frequency updates.

These features require connected clients and channel authorization. Broadcast and Presence do not replace a durable inbox or send OS-level push to a closed browser. Postgres Changes observe Supabase Postgres, not SQL Server. Mirroring SQL business rows into Postgres solely to obtain change feeds would create a second source that can lag or drift.

References: [Supabase Realtime overview](https://supabase.com/docs/guides/realtime), [Postgres Changes and Broadcast](https://supabase.com/docs/guides/realtime/subscribing-to-database-changes), [Realtime authorization](https://supabase.com/docs/guides/realtime/authorization), and [Presence](https://supabase.com/docs/guides/realtime/presence).

## Firebase and backend alternatives

| Option                                 | Fit                                                                                                                                                                                 | Boundaries and trade-offs                                                                                                                                                                                                                             |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Firebase Cloud Firestore listeners** | `onSnapshot` can stream document/query updates and use local cache.                                                                                                                 | Requires adding Firestore, security rules, and a synchronization/ownership design. It would duplicate SQL Server business records and charge for listener reads; Firebase Auth is not the DigiSay identity authority. Do not add it for this project. |
| **Firebase Realtime Database**         | Can stream small JSON state with low latency.                                                                                                                                       | Adds a second authoritative-looking database and rules surface. No current state needs that model; it duplicates SQL Server responsibilities.                                                                                                         |
| **Supabase Realtime Broadcast**        | Could deliver an authorized transient “record changed” event to connected dashboard clients without copying SQL rows.                                                               | Needs backend event publishing, private topic authorization, reconnect/refetch behavior, and operational monitoring. It is useful only after a concrete live-screen requirement exists.                                                               |
| **Supabase Postgres Changes**          | Convenient if the subscribed data is actually stored in Supabase Postgres.                                                                                                          | Business records are in SQL Server. Replicating them for this feature would add consistency and deletion complexity.                                                                                                                                  |
| **ASP.NET Core SignalR**               | If a named screen later needs server-authorized live updates from SQL-backed workflows, the API can publish to user/tenant groups and clients can refetch canonical data over HTTP. | Connections are transient and do not deliver while clients are offline. Scale-out may require Azure SignalR Service or a Redis backplane; group membership must be derived from verified identity/tenant authorization.                               |
| **Existing HTTP polling**              | Meets the current low-frequency API-health indicator need.                                                                                                                          | The 30-second interval is unsuitable for high-urgency business updates but adds no new provider or data store.                                                                                                                                        |
| **FCM**                                | Suitable for opt-in browser notifications while the site is in the background.                                                                                                      | FCM is a push-delivery channel, not a connected-client realtime subscription or durable inbox; see ADR-0001 for its consent and SQL outbox requirements.                                                                                              |

Firebase does have realtime database/listener products, but those are not selected because they would add another business data authority. Supabase Realtime is also deferred because no current page needs live business events.

## Recommendation

Do **not** add a realtime SDK, database publication, websocket hub, or polling loop in this phase. Keep the existing 30-second health check. If an approved product flow later needs a live update while the dashboard is open, prefer **ASP.NET Core SignalR** for updates originating from SQL Server workflows; send only an event ID/type, then let the client refetch the authorized record through the API. Consider **Supabase Broadcast** instead only if the event is transient and the team specifically wants Supabase to carry connected-client messages. Add Presence only for a named collaboration feature. Do not use Postgres Changes for SQL Server data.

Keep disconnected-user alerts separate: once events and recipients are approved, use the FCM/outbox design in ADR-0001 for browser background push, with SQL Server holding the durable notification record.

Revisit this decision when one of these conditions is approved and measured: a workflow needs a latency below the existing poll interval, simultaneous editing/online presence is introduced, or polling load becomes material. The owner must then define authorization, stale/reconnect recovery, event ordering, and availability expectations before selecting a transport.

## Configuration and decisions requested

No new configuration or secrets are required for this decision. No user decision is needed to defer Realtime on the current product. If a live workflow is planned, identify the screen, event, target latency, and whether the audience includes offline users; that will determine whether SignalR, Supabase Broadcast, or FCM is appropriate.

## Implementation guardrails (required before enabling a realtime transport)

Any future SignalR or Supabase Broadcast implementation must satisfy all of these:

- Authenticate every connection with the application's trusted identity provider. Authorize subscriptions separately from connection authentication.
- Derive SignalR groups/private topics from verified subject and current tenant membership on the server. Never accept arbitrary client-selected group names or tenant IDs as authorization evidence.
- Re-check authorization when joining/rejoining groups and remove memberships when access or tenant membership is revoked. Cover cross-tenant subscription attempts with negative tests.
- Treat realtime messages as invalidation hints, not canonical business data. Send an event ID/type and safe version/cursor only; fetch the current record through the authorized API.
- Define reconnect behavior: refresh the authenticated connection, rejoin only authorized groups, detect missed events using a cursor/version where available, and refetch the relevant API state after reconnect. WebSocket delivery alone cannot guarantee no missed messages.
- Define event ordering/versioning and client deduplication. Consumers must tolerate duplicate, delayed, and out-of-order notifications.
- Keep SQL Server as the source of truth. Do not add a second business-data projection merely to obtain Postgres Changes.
- Add tests for unauthorized connections, cross-tenant group access, revoked membership, reconnect/replay, duplicate events, and API refetch behavior before rollout.

These are adoption gates only. They do not justify adding SignalR, Redis, Supabase Realtime, or a polling loop before a named product screen and latency requirement are approved.


## Implementation guardrails before enabling a realtime transport

- Authenticate every connection with the application's trusted identity provider. Authorize subscriptions separately from connection authentication.
- Derive SignalR groups or private topics from verified subject and current tenant membership on the server. Never accept arbitrary client-selected group names or tenant IDs as authorization evidence.
- Re-check authorization when joining or rejoining groups and remove memberships when access or tenant membership is revoked. Cover cross-tenant subscription attempts with negative tests.
- Treat realtime messages as invalidation hints, not canonical business data. Send an event ID/type and safe version or cursor only; fetch the current record through the authorized API.
- Define reconnect behavior: refresh the authenticated connection, rejoin only authorized groups, detect missed events using a cursor/version where available, and refetch relevant API state after reconnect. WebSocket delivery alone cannot guarantee no missed messages.
- Define event ordering/versioning and client deduplication. Consumers must tolerate duplicate, delayed, and out-of-order notifications.
- Keep SQL Server as the source of truth. Do not add a second business-data projection merely to obtain Postgres Changes.
- Add tests for unauthorized connections, cross-tenant group access, revoked membership, reconnect/recovery, duplicate events, and API refetch behavior before rollout.

These are adoption gates only. They do not justify adding SignalR, Redis, Supabase Realtime, or a polling loop before a named product screen and latency requirement are approved.
