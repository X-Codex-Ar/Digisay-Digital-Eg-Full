# AI engineering roadmap

## Repository audit

The platform has three independently deployed apps: the React public site (`public/`), Angular dashboard (`dashboard/`), and ASP.NET Core API (`backend/`). The API owns authentication, organization authorization, CRM workflows, and SQL Server persistence. Firebase currently provides browser analytics only; Supabase provides optional health checking and private object storage. The `ai-agents/` directory is documentation, not a running agent service. There is no configured model provider, inference endpoint, model key, AI queue/outbox, or AI-specific database schema. The current feature branch contains a provider-neutral service-request triage Application contract and handler, but it is not registered or exposed at runtime.

That means AI must be introduced through a backend-owned feature slice. Browser apps must never hold provider credentials, call a model directly with business records, or become a source of business truth. SQL Server remains authoritative.

## Feature inventory against the repository

| Capability | Current repository evidence | Missing before it is a usable feature |
| --- | --- | --- |
| Public website chatbot | No chat widget, chat API, FAQ corpus, or inference call exists. The React site has public service and blog content that can seed an approved FAQ. | Curated and versioned public answers; backend provider proxy; source-linked responses and refusal behavior; abuse/rate/cost controls; consent and transcript policy; accessible React chat UX; evaluation set and operator monitoring. Start read-only and route contact requests through the existing contact form. |
| CRM service-request triage | A provider-neutral port, tenant-scoped Application handler, output validator, and synthetic tests exist on the current AI feature branch. | Approved taxonomy/provider/data policy; real and tested minimizer; provider adapter and secrets; authenticated/rate-limited API endpoint; persisted versioned suggestion and accept/edit/reject audit; Angular staff review UI; evaluation, cost/timeout controls, kill switch, and operational telemetry. Nothing currently invokes a model. |
| Lead triage | CRM lead APIs exist, but the current triage contract is only for organization-scoped service requests. | Decide whether lead triage is in scope; minimize contact data separately; do not send name/email by default; add tenant-scoped use case, tests, persisted review state, and staff UI only after approvals. |
| Authenticated client-support chatbot | No support conversation/ticket API or client-specific knowledge retrieval workflow exists; dashboard Support is a placeholder. | First implement support/domain APIs, tenant/resource authorization and membership checks, approved knowledge sources with per-document ACLs, conversation lifecycle, explicit transcript consent/retention, staff handoff, abuse controls, citations, and isolation/evaluation tests. Do not build a bot that can access projects or client records before those controls exist. |
| Internal knowledge assistant | No approved knowledge corpus, ingestion/indexing pipeline, retrieval service, or source ACL mapping exists. | Named content owners; versioned and access-controlled sources; deletion/re-index lifecycle; grounded retrieval with citations; permission filtering before retrieval; prompt-injection defenses; freshness, access-denial, and answer-quality evaluations. |
| Content creation copilot | The public site has static service/blog copy; no editorial workflow or AI content API exists. | Brand-approved source material, draft-only generation for briefs/captions/translation, source and claim checks, human edit/approval, version history, and a clear no-auto-publish boundary. |
| Media transcription and metadata | Private object storage primitives exist, but a media asset catalog, transcription pipeline, consent/rights metadata, and review workflow do not. | Asset records and ownership, supported media limits, signed access, licensed processing terms, redaction, retention/deletion, language/quality evaluation, and staff confirmation before metadata is saved. |
| Campaign analytics and forecasting | Campaign/project APIs and a governed analytics dataset are not implemented. | Complete campaign data model and APIs, metric definitions, data quality checks, tenant-filtered aggregates, freshness/provenance, and a back-tested baseline before predictive claims. |
| Rights/piracy analysis | No rights evidence index, matching pipeline, or review queue exists. | Licensed/authorized evidence sources, chain-of-custody and source attribution, false-positive evaluation, legal review, and investigator workflow. Keep any future output advisory; never auto-issue takedowns or legal conclusions. |

The public FAQ chatbot is the most practical first **user-facing** AI pilot because it can be restricted to public, approved material. CRM triage remains a separate backend foundation already under review. Do not combine public visitor chats with tenant CRM or client data.

## Ranked feature candidates

| Priority | Candidate | Product value | Readiness | Data exposure | Consequence of an incorrect result | Initial behavior |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Public website FAQ and service-discovery chatbot | Helps visitors understand services and find the right contact path | Medium-high: public service/blog content exists, but it is not a curated FAQ and no chat workflow exists | Low if restricted to public content; visitor-entered text still needs handling rules | Low-medium: wrong service or capability claims can damage trust or create commitments | Answer only from approved public sources, cite/link them, say when uncertain, and direct inquiries to the existing contact form; no quotes, promises, CRM writes, or private data |
| 2 | Service-request triage suggestions | Reduces staff review time for incoming client requests | Medium: CRM request lifecycle and the AI Application foundation exist; provider, persistence, endpoint, and review UI do not | Medium-high: request descriptions can contain personal or confidential data | Medium: incorrect urgency can delay a response or misroute work | Suggest category, urgency, and rationale for staff review; never transition the request automatically |
| 3 | Draft-only content copilot | Speeds preparation of campaign briefs, captions, and translations | Low-medium: static public copy exists; no editorial workflow or approved internal brand corpus | Low for public source text; higher if client briefs or unreleased campaigns are included | Medium: unsupported claims, brand errors, or rights issues can be published | Draft with sources and claim warnings; require editor approval; do not publish or schedule |
| 4 | Authenticated client-support and internal knowledge assistant | Reduces repeated support work and speeds staff discovery | Low: support workflows and an ACL-aware knowledge corpus are absent | High: client/project/support documents are tenant-confidential | High: disclosure across tenants or misleading guidance can affect client operations | Retrieve only authorized documents, cite sources, and hand off to staff; no CRM/project mutations |
| 5 | Media transcription and metadata suggestions | Improves search and accessibility for approved media | Low: storage primitives exist but media catalog and processing/review workflows do not | High: uploads may contain personal, licensed, or unreleased content | Medium-high: inaccurate captions, translations, or ownership assumptions can harm clients | Propose transcript/language/tags with timestamps and confidence; staff verifies before saving |
| 6 | Campaign reporting and forecasting | Speeds campaign analysis and planning | Low: campaign APIs and a governed analytics dataset are not implemented | High: source data is tenant-confidential | Medium-high: incorrect metrics or forecasts can mislead commercial decisions | Summarize only defined, tenant-authorized metrics with source and time range; label forecasts and uncertainty |
| 7 | Rights and infringement evidence ranking | Helps investigators prioritize possible unauthorized distribution | Very low: no rights evidence index or matching workflow exists | High: source media and rights evidence can be confidential or licensed | Very high: false positives can cause legal or commercial harm | Rank evidence for human investigators only; never issue notices or legal conclusions |

## Recommended first vertical slice

For a first visible pilot, start with a **read-only public FAQ chatbot** after product and security/privacy approval. Use only a small curated set of public service facts and approved site content; return citations/links and a clear contact-form handoff. Do not give the public bot access to CRM, tenant data, arbitrary web search, or write-capable tools. Keep **staff-reviewed service-request triage** as a separate feature: the current provider-neutral foundation is a start, not a live feature. Confirm whether triage will later cover client service requests, public inquiries, or leads; do not merge these data sets implicitly.

For **CRM triage**, the first product slice should return a small typed result: category, urgency, concise rationale, and confidence/evidence fields. Store the result as a separate, versioned suggestion linked to the source record; never overwrite the source record with raw model output. Before implementation, product and security/privacy owners must agree the minimum persisted fields, retention/deletion period, and access policy. The audit trail must capture the suggestion ID and version, tenant and source-record references, provider/model/prompt versions, creation time, and the acting staff member's accept/edit/reject decision, timestamp, and accepted or edited values. Keep raw prompts, full model responses, and unnecessary personal data out of logs and audit records. A staff member must accept or edit a suggestion before it affects routing or workflow state. A provider outage must leave the existing inquiry/CRM workflow usable.

## Architecture and location

- `ai-agents/`: feature specifications, prompt versions, evaluation fixtures, and operator documentation. No credentials or production customer data belong here.
- `backend/src/DigiSay.Application/Features/AI/`: provider-neutral use cases and contracts; the triage foundation exists on the current feature branch but is not enabled at runtime.
- `backend/src/DigiSay.Infrastructure/Integrations/AI/`: provider client, configuration, timeout/retry policy, and secret-backed implementation.
- `backend/src/DigiSay.API/`: provider proxy and authenticated/rate-limited endpoints. Public FAQ endpoints must only retrieve public approved content; tenant identity for protected endpoints must come from verified API context, never a client-supplied organization identifier.
- `public/`: public FAQ chat interface only; it receives the answer/citation contract from the API and never holds provider credentials.
- `dashboard/`: present triage suggestions and provenance with accept/edit/reject actions for staff. Keep provider SDKs and secrets out of browser bundles.
- SQL Server: persist source records and any accepted suggestion/audit state. Use an outbox and background worker if inference becomes asynchronous; neither exists today.
- Knowledge content: start with versioned, curated FAQs. Add vector/search infrastructure only when corpus size and evaluation show it is needed; every indexed document needs owner, visibility, version, and deletion behavior.

Avoid a standalone AI microservice, multi-agent orchestration, or a multi-provider abstraction until a concrete scale or provider requirement justifies them.

## Mandatory gates before external inference

| Gate | Accountable approver | Evidence required to pass |
| --- | --- | --- |
| Product workflow and scope | Product owner (TBD) | Written workflow, target record type, authorized staff roles, success metric, prohibited AI actions, and agreed persistence fields/status lifecycle |
| Provider and data processing | Security/privacy owner (TBD) | Approved provider terms and deployment region; documented lawful data scope, provider retention/training settings, and a reviewed minimization/redaction plan |
| Tenant, runtime, and operations controls | Backend/security owner (TBD) | Passing cross-tenant/authorization tests; configured rate limits, per-tenant cost ceilings, timeout/failure behavior, and a tested operator kill switch |
| Quality and safety evaluation | AI engineer plus product owner (TBD) | Versioned model/prompt, privacy-reviewed representative evaluation set, recorded results meeting an agreed threshold, and documented known failure modes |
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

## Delivery phases and missing work

1. **Read-only public FAQ chatbot:** agree public scope and provider terms; curate source answers; implement backend-only provider access, citations/refusal behavior, rate/cost/timeout limits, privacy notice, abuse protections, and an accessible React widget; evaluate supported questions, unsupported questions, prompt injection, and factual grounding. Route contact intent to the existing form. No account context, memory, lead creation, or arbitrary tools.
2. **Service-request triage completion:** continue from the provider-neutral Application foundation; approve taxonomy/provider and minimization; add persistent suggestions/audit, endpoint, staff UI, evaluation, and operational controls; retain human accept/edit/reject.
3. **Staff content copilot:** after internal brand/content sources and editorial owners are defined, produce drafts only with source links, claim checks, revision history, and editor approval.
4. **Client/internal knowledge assistant:** only after support/project/campaign data APIs, tenant/resource authorization, document ACLs, and corpus lifecycle exist. Separate public, employee, and tenant-private collections and contexts.
5. **Media and campaign intelligence:** after asset/campaign models, rights/consent, data quality, and measurable baselines exist.
6. **Rights evidence ranking:** last, with legal/security review and investigator-only decisions.

For every feature, implement offline evaluation before a user rollout, set measurable acceptance thresholds before seeing production results, track answer grounding/abstention and human correction, and retain a kill switch. Do not introduce autonomous agents, arbitrary tool use, cross-tenant retrieval, or auto-publishing as part of the chatbot MVP.

## Phase 2 foundation status

The current feature branch adds a provider-neutral service-request triage port and Application use case under `backend/src/DigiSay.Application/Features/AI/ServiceRequestTriage/`. The use case looks up requests only through the verified organization scope, calls an explicit minimizer before the provider boundary, validates bounded model output, and marks every result for human review. Synthetic Application tests cover scoping, minimization, and output validation. The branch does not register a provider, expose an API endpoint, add a dashboard action, persist suggestions, or transmit request content. The foundation is pending PR review; all provider/runtime work remains gated on the decisions above.
