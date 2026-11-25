# AI engineering roadmap

## Repository audit

The platform has three independently deployed apps: the React public site (`public/`), Angular dashboard (`dashboard/`), and ASP.NET Core API (`backend/`). The API owns authentication, organization authorization, CRM workflows, and SQL Server persistence. Firebase currently provides browser analytics only; Supabase provides optional health checking and private object storage. The `ai-agents/` directory is documentation, not a running agent service. There is no model SDK, inference endpoint, model key, queue/outbox, or AI-specific database schema.

That means AI must be introduced through a backend-owned feature slice. Browser apps must never hold provider credentials, call a model directly with business records, or become a source of business truth. SQL Server remains authoritative.

## Ranked feature candidates

| Priority | Candidate | Product value | Readiness | Data exposure | Consequence of an incorrect result | Initial behavior |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Inquiry and CRM triage suggestions | Reduces staff review time for incoming leads and service requests | Medium: contact and CRM workflows exist, but staff-facing inquiry review and AI processing do not form a complete workflow yet | Medium-high: free text may contain personal or confidential data | Medium: incorrect urgency can delay a response; an incorrect category can misroute work | Suggest category, urgency, and a short rationale; staff accepts or edits before any CRM change |
| 2 | Uploaded-content metadata suggestions | Improves cataloging and search for media assets | Medium-low: private storage exists, but no metadata workflow or media analysis service exists | High: uploads may contain personal, licensed, or unreleased content | Low-medium: incorrect tags or captions can impair search or misrepresent content | Propose tags/caption/language; require staff confirmation before saving |
| 3 | Grounded campaign reporting and knowledge search | Speeds internal research and campaign reporting | Low: campaign data and an approved knowledge corpus are not yet modeled end to end | High: source material may include confidential tenant or campaign data | Medium-high: inaccurate claims or unauthorized disclosure can affect commercial decisions | Answer only from authorized records and cite the records used; show uncertainty |
| 4 | Rights and infringement analysis | Helps prioritize possible unauthorized distribution | Low: no detection/evidence pipeline is present | High: source media and rights evidence can be confidential or licensed | Very high: false positives can cause legal or commercial harm | Rank evidence for human investigators only; never issue notices or legal conclusions |

## Recommended first vertical slice

Start with **staff-reviewed inquiry/CRM triage**, only after product and privacy owners approve the use case and provider/data terms. It has a clear human operator and can be introduced as a suggestion without changing the SQL Server source record or taking an external action. Confirm whether the first target is public contact inquiries or tenant-scoped CRM leads; do not merge these data sets implicitly.

The first product slice should return a small typed result: category, urgency, concise rationale, and confidence/evidence fields. Store the result as a separate, versioned suggestion linked to the source record; never overwrite the source record with raw model output. Before implementation, product and security/privacy owners must agree the minimum persisted fields, retention/deletion period, and access policy. The audit trail must capture the suggestion ID and version, tenant and source-record references, provider/model/prompt versions, creation time, and the acting staff member's accept/edit/reject decision, timestamp, and accepted or edited values. Keep raw prompts, full model responses, and unnecessary personal data out of logs and audit records. Editing creates a new pending version and never changes workflow state; an authorized staff member must explicitly accept the current version before it affects routing or workflow state. A provider outage must leave the existing inquiry/CRM workflow usable.

Persist every generated suggestion separately from its source record, including suggestions that are pending review, edited, or rejected. The persisted states are `pending`, `edited`, `accepted`, and `rejected`, with transitions `pending -> edited`, `pending -> accepted`, `pending -> rejected`, `edited -> edited`, `edited -> accepted`, or `edited -> rejected`; accepted and rejected are terminal. Each human edit creates a new immutable version linked to the preceding version. Never overwrite the model-generated version or apply a suggestion to CRM until an authorized reviewer accepts the current version.

Each version stores only the typed suggestion fields needed for review, tenant and source-record references, provider/model/prompt identifiers, and creation time. An append-only audit entry records each state transition, prior and new state, version, actor identity (system or staff reviewer), UTC timestamp, and accepted or edited values; human transitions identify the reviewer. A rejection reason is optional and must exclude unnecessary personal data. Apply the owner-approved retention period to all suggestion versions and audit values. Deleting a source record deletes its linked suggestion content and audit values too, except for a non-identifying tombstone kept only when an approved legal or security requirement demands it. Product and security/privacy owners must set the retention period and any tombstone exception before inference or persistence is enabled. Until then, keep inference disabled and persist no suggestions.

## Architecture and location

- `ai-agents/`: feature specifications, prompt versions, evaluation fixtures, and operator documentation. No credentials or production customer data belong here.
- `backend/src/DigiSay.Application/Features/AI/`: use cases and provider-neutral contracts, introduced only with the first approved feature.
- `backend/src/DigiSay.Infrastructure/Integrations/AI/`: provider client, configuration, timeout/retry policy, and secret-backed implementation.
- `backend/src/DigiSay.API/`: authenticated, authorized, rate-limited endpoints. Derive tenant identity from verified API context; never accept an organization identifier as authorization proof.
- `dashboard/`: present suggestions, provenance, and accept/edit/reject actions for staff. Keep provider SDKs and secrets out of browser bundles.
- SQL Server: persist source records separately from the versioned suggestion lifecycle and transition audit described above. Use an outbox and background worker if inference becomes asynchronous; neither exists today.

Avoid a standalone AI microservice, multi-agent orchestration, or a multi-provider abstraction until a concrete scale or provider requirement justifies them.

## Mandatory gates before external inference

| Gate | Accountable approver | Evidence required to pass |
| --- | --- | --- |
| Product workflow and scope | Product owner (TBD) | Written workflow, target record type, authorized staff roles, success metric, prohibited AI actions, and agreed persistence fields/status lifecycle |
| Provider and data processing | Security/privacy owner (TBD) | Approved provider terms and deployment region; documented lawful data scope, provider retention/training settings, and a reviewed minimization/redaction plan |
| Tenant, runtime, and operations controls | Backend/security owner (TBD) | Passing cross-tenant/authorization tests; configured rate limits, per-tenant cost ceilings, timeout/failure behavior, and a tested operator kill switch |
| Quality and safety evaluation | AI engineer plus product owner (TBD) | Versioned model/prompt, privacy-reviewed representative evaluation set, recorded results meeting an agreed threshold, and documented known failure modes |
| Observability and incident readiness | Backend/operations owner (TBD) | Approved dashboards and alerts for availability, latency, provider errors, rate-limit/cost usage, and review outcomes; a recorded baseline and alert thresholds; an incident/kill-switch drill with evidence and owner sign-off recorded for release |
| Persistence, audit, and retention | Product and security/privacy owners (TBD) | Approved data schema and retention/deletion period; audit test evidence for accept/edit/reject actor, time, suggestion version, and final accepted values; proof that raw prompts and unnecessary personal data are not logged |
| Human oversight | Product owner (TBD) | Tested staff review flow that blocks workflow changes, messages, billing effects, or legal/takedown actions until an authorized human accepts or edits the suggestion |

Owners marked TBD are an explicit release blocker: assign named approvers before any external inference is enabled. Keep each gate's evidence with the feature's release record. Tests must cover malformed/untrusted model output, provider timeout/failure, rate and cost limits, and accept/edit/reject behavior as well as tenant isolation.

## Current decisions still needed

- Confirm public inquiries versus tenant-scoped CRM leads as the first data source.
- Select an approved model/provider and deployment region after reviewing data-processing terms.
- Decide permitted retention for prompts and suggestions, including provider-side retention.
- Set the success threshold and who is authorized to accept suggestions.
- Confirm the persisted suggestion and audit fields, retention/deletion policy, and named approvers for every pre-inference gate.

Until those are agreed, keep AI disabled and do not transmit customer or business data to a model provider.
