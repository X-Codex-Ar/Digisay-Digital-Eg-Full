# Artist performance analytics copilot

## Purpose and scope

This is a separate, authenticated Dashboard use case for an artist, label, or authorized account manager to ask questions such as “What are my top-performing assets this month, and what should I focus on?” It is not the public FAQ chatbot. Reuse the same server-side OpenAI client and safety infrastructure, but keep the assistant identity, conversation context, tool set, data access, and evaluations separate.

The copilot may explain verified reports and recommend follow-up based on measured facts. It must not make up revenue, settle royalty disputes, infer legal ownership, contact platforms, change campaigns, publish content, or execute rights actions.

## Repository audit: hard prerequisites are missing

The current backend has organizations, memberships, CRM leads/service requests, contact inquiries, and private object storage. It does **not** have `Artist`, `Recording/Track`, platform asset mapping, performance fact, royalty statement line, rights case, or campaign reporting entities and APIs. Angular campaign, content, reports, and client-support pages are still placeholders. Therefore, the “500 songs” scenario cannot return real rankings yet; connecting an LLM to the current schema would generate unsupported answers.

Before the assistant, product/data owners must identify actual platform reporting sources, ownership of the 500-song catalog, ingestion frequency, and definitions for:

- Canonical asset identity and platform IDs (including ISRC/UPC where available), duplicate recordings, versions, collaborations, and catalog transfers.
- Revenue meaning: gross/net, fees/refunds/adjustments, ownership share, currency and FX date, statement period, territory, and whether statement data is reconciled or estimated.
- Performance metrics by platform and time bucket, their source and refresh time, and rules for incomplete/stale periods.
- Rights facts: agreement/claim status, territories, term dates, ownership evidence, source and last verification. A model cannot create or adjudicate these facts.

## Target architecture

```text
Angular dashboard
  -> authenticated /api/v1/organizations/{verified scope}/assistant request
  -> Application assistant workflow
       -> OpenAI Responses API with a small allowlist of function tools
       -> backend executes each tool using verified organization/user context
  -> Application analytics queries -> SQL Server (authoritative facts)
  -> structured answer + exact report references -> dashboard
```

The public FAQ and this copilot should use one configured OpenAI Responses integration in Infrastructure. They must not share prompts, history, retrieval collections, or authorization. The current adapter lives in `backend/src/DigiSay.Infrastructure/AI/`; keep provider code there unless the repository's established structure is deliberately moved. Define `IArtistAnalyticsReadService` and the orchestration/use case in `backend/src/DigiSay.Application/Features/AI/ArtistAnalytics/`; expose authenticated routes from `backend/src/DigiSay.API/Endpoints/AI/`; put the UX in `dashboard/src/app/features/ai/` only after the API and data contracts exist.

## Tools and calculation rules

Start with typed read-only functions such as:

- `get_top_performing_assets(period, metric, platform?, limit)`
- `get_platform_breakdown(period, metric)`
- `get_asset_performance(assetId, period)`
- `get_verified_rights_summary(assetId)` once a rights module exists

The API derives organization membership, user identity, role, and asset authorization from authenticated server context. The model never supplies an organization ID that grants access. Validate every function argument against enums, date bounds, row limits, and the caller's permissions. Never expose arbitrary SQL, database connections, or a general data-fetch tool. Cap the number of model/tool steps and return a safe error if a tool times out.

SQL/application queries calculate revenue totals, rankings, percentages, currency conversions, and period comparisons. The model only selects an approved read function and explains its result. Do not sum different currencies or mix gross/net and reconciled/estimated records. If a query returns incomplete or stale facts, carry that limitation into the response.

Return a schema-validated response containing a concise answer, metric values, metric definitions, period, currency, platform, source/report references, last-updated time, and limitations. Verify those values against the server tool result; model-generated citations or numeric values alone are not evidence. Human review is required before using recommendations to change a business workflow.

## Reuse the canonical capability plan

The single OpenAI capability inventory, implementation status, and official API references live in [`docs/architecture/AI-ENGINEERING-ROADMAP.md`](../../docs/architecture/AI-ENGINEERING-ROADMAP.md#openai-capability-map-and-non-duplicated-assistant-design). Keep this artist-specific document focused on its data model, permissions, deterministic analytics, and rollout sequence rather than maintaining a second capability matrix.

For this copilot, the planned capabilities have strict roles: SQL-backed application queries calculate metrics; Responses function calling may select only allowlisted read functions; Structured Outputs shapes the answer; and moderation may screen text after policy approval. Document search and image understanding are separate later features, not dependencies for revenue analytics. For a document corpus, choose one retrieval/indexing path after ACL and retention review instead of indexing the same files in both OpenAI File Search and a custom embedding store. `store=false` on Responses requests does not by itself guarantee zero retention.

## Required delivery sequence

1. Approve data owners, metric definitions, rights semantics, reporting sources, and an ingestion/reconciliation strategy.
2. Add organization-scoped SQL Server catalog, mapping, platform fact, and statement-line modules with migrations and integration tests. Preserve source IDs, load time, currency, status, and correction lineage.
3. Implement typed backend analytics queries, tenant/resource authorization tests, freshness indicators, and deterministic calculation tests. No model calls yet.
4. Add one shared server-side OpenAI Responses integration with bounded tool loop, per-account budget/limits, timeout/failure policy, secret management, moderation, audit metadata, and kill switch.
5. Add offline evaluations against verified synthetic and approved de-identified reporting cases. Measure ranking exactness, currency correctness, answer grounding, permission denials, and abstention on missing/stale data.
6. Add a Dashboard copilot view with metric/source citations and explicit reporting period. Keep recommendations advisory and all business mutations outside the assistant.

No artist-specific AI API or model integration should be enabled until the source-data/domain work and its authorization tests have passed.
