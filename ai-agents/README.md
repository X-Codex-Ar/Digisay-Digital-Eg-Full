# DigiSay AI Agents & Intelligence Services

This folder is the home for AI product specifications, evaluations, prompts, and (when approved) agent workflows supporting DigiSay's business capabilities. The current feature branch also contains a provider-neutral service-request triage contract in the backend, but there is no model SDK configured, provider integration, AI API, chatbot, or autonomous agent in production.

## Scope & Purpose

- **CRM service-request triage (backend foundation in review):** Future suggestions may include category, urgency, and rationale for staff review. Keep them separate from the authoritative SQL Server record; do not auto-reply, assign, or transition a CRM record.
- **Public website FAQ chatbot (recommended first user-facing pilot):** Answer from curated public service information only, link sources, state uncertainty, and direct contact intent to the existing contact form. Do not access CRM or client data, make commitments, or invoke write-capable tools.
- **Authenticated client support assistant (later):** Requires functional support APIs, tenant/resource authorization, permission-aware knowledge retrieval, transcript consent/retention, and staff handoff before it can safely answer client-specific questions.
- **Content metadata suggestions:** Propose captions, language, and tags for uploaded media, with staff correction before saving.
- **Campaign reporting and knowledge search:** Summarize authorized campaign data and approved company materials with source references.
- **Rights and infringement analysis:** A later, higher-risk capability that may prioritize evidence for reviewers; it must never issue a takedown or make a legal determination automatically.

See [`docs/architecture/AI-ENGINEERING-ROADMAP.md`](../docs/architecture/AI-ENGINEERING-ROADMAP.md) for the repository audit, priorities, and implementation gates.
The provider-neutral first slice contract and its disabled-by-default status are documented in [`triage/README.md`](triage/README.md).
No provider is currently enabled; do not put provider keys or customer content into the React or Angular apps.

## Roles & Developer Responsibilities

### AI / Agentic Systems Engineer
- Own the AI feature backlog, evaluation sets, model/provider decisions, and prompt/version change review.
- Minimize and redact payloads; enforce tenant boundaries before any provider call and document retention and residency.
- Set per-request and per-tenant token/cost limits, rate limits, timeout behavior, provider failure handling, and privacy-safe telemetry.
- Keep business rules and persistence in `backend/src/DigiSay.Application` and `backend/src/DigiSay.Infrastructure`; expose provider-neutral contracts to the application layer.
- Require a measurable offline evaluation and human review for consequential suggestions before enabling a feature for users.

### Backend & Frontend Developers
- Ensure proposed AI results respect the existing Clean Architecture and organization isolation in `backend/`.
- Show suggestions and their rationale in `dashboard/`; never execute irreversible actions (including legal takedowns or billing changes) from an AI result.
