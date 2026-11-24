# AI engineering roadmap

## Repository audit

The platform has three independently deployed apps: the React public site (`public/`), Angular dashboard (`dashboard/`), and ASP.NET Core API (`backend/`). The API owns authentication, organization authorization, CRM workflows, and SQL Server persistence. Firebase currently provides browser analytics only; Supabase provides optional health checking and private object storage. The `ai-agents/` directory is documentation, not a running agent service. There is no model SDK, inference endpoint, model key, queue/outbox, or AI-specific database schema.

That means AI must be introduced through a backend-owned feature slice. Browser apps must never hold provider credentials, call a model directly with business records, or become a source of business truth. SQL Server remains authoritative.

## Ranked feature candidates

| Priority | Candidate | Product value | Readiness | Data / error risk | Initial behavior |
| --- | --- | --- | --- | --- | --- |
| 1 | Inquiry and CRM triage suggestions | Reduces staff review time for incoming leads and service requests | Medium: contact and CRM workflows exist, but staff-facing inquiry review and AI processing do not form a complete workflow yet | Medium: free text may contain personal or confidential data; incorrect urgency can delay a response | Suggest category, urgency, and a short rationale; staff accepts or edits before any CRM change |
| 2 | Uploaded-content metadata suggestions | Improves cataloging and search for media assets | Medium-low: private storage exists, but no metadata workflow or media analysis service exists | Medium-high: uploads may contain personal, licensed, or unreleased content | Propose tags/caption/language; require staff confirmation before saving |
| 3 | Grounded campaign reporting and knowledge search | Speeds internal research and campaign reporting | Low: campaign data and an approved knowledge corpus are not yet modeled end to end | Medium: incorrect summaries or unauthorized cross-tenant retrieval | Answer only from authorized records and cite the records used; show uncertainty |
| 4 | Rights and infringement analysis | Helps prioritize possible unauthorized distribution | Low: no detection/evidence pipeline is present | High: false positives can cause legal or commercial harm | Rank evidence for human investigators only; never issue notices or legal conclusions |

## Recommended first vertical slice

Start with **staff-reviewed inquiry/CRM triage**, only after product and privacy owners approve the use case and provider/data terms. It has a clear human operator and can be introduced as a suggestion without changing the SQL Server source record or taking an external action. Confirm whether the first target is public contact inquiries or tenant-scoped CRM leads; do not merge these data sets implicitly.

The first product slice should return a small typed result: category, urgency, concise rationale, and confidence/evidence fields. Store the result as a separate, versioned suggestion linked to the source record. A staff member must accept or edit it before it affects routing or workflow state. A provider outage must leave the existing inquiry/CRM workflow usable.

## Architecture and location

- `ai-agents/`: feature specifications, prompt versions, evaluation fixtures, and operator documentation. No credentials or production customer data belong here.
- `backend/src/DigiSay.Application/Features/AI/`: use cases and provider-neutral contracts, introduced only with the first approved feature.
- `backend/src/DigiSay.Infrastructure/Integrations/AI/`: provider client, configuration, timeout/retry policy, and secret-backed implementation.
- `backend/src/DigiSay.API/`: authenticated, authorized, rate-limited endpoints. Derive tenant identity from verified API context; never accept an organization identifier as authorization proof.
- `dashboard/`: present suggestions, provenance, and accept/edit/reject actions for staff. Keep provider SDKs and secrets out of browser bundles.
- SQL Server: persist source records and any accepted suggestion/audit state. Use an outbox and background worker if inference becomes asynchronous; neither exists today.

Avoid a standalone AI microservice, multi-agent orchestration, or a multi-provider abstraction until a concrete scale or provider requirement justifies them.

## Mandatory gates before external inference

1. Product owner confirms the exact workflow, target records, user roles, success metric, and actions AI is forbidden to take.
2. Security/privacy owners approve provider terms, region, retention/training settings, lawful data scope, and a PII minimization/redaction plan.
3. Define tenant isolation, authorization, rate limits, per-tenant token/cost budgets, timeouts, safe failure behavior, and an operator kill switch.
4. Version prompts and models; create representative, privacy-reviewed evaluation examples and measurable quality thresholds before enabling users.
5. Record model/version, source record ID, suggestion status, and sanitized operational metrics. Do not log raw prompts, credentials, or unnecessary personal data.
6. Require human review before a suggestion can change CRM lifecycle, send a message, affect billing, or drive legal/takedown action.
7. Add tests for cross-tenant denial, malformed/untrusted model output, provider timeout/failure, rate and cost limits, and accept/edit/reject behavior.

## Current decisions still needed

- Confirm public inquiries versus tenant-scoped CRM leads as the first data source.
- Select an approved model/provider and deployment region after reviewing data-processing terms.
- Decide permitted retention for prompts and suggestions, including provider-side retention.
- Set the success threshold and who is authorized to accept suggestions.

Until those are agreed, keep AI disabled and do not transmit customer or business data to a model provider.
