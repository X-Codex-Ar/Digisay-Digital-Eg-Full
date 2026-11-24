# DigiSay AI Agents & Intelligence Services

This folder is the home for AI product specifications, evaluations, prompts, and (when approved) agent workflows supporting DigiSay's business capabilities. It currently contains planning only: there is no model SDK, provider integration, AI API, or autonomous agent in production.

## Scope & Purpose

- **Inquiry and CRM triage (first candidate):** Suggest a category, urgency, and short rationale for staff review. Keep the suggestion separate from the authoritative SQL Server record; do not auto-reply, assign, or transition a CRM record.
- **Content metadata suggestions:** Propose captions, language, and tags for uploaded media, with staff correction before saving.
- **Campaign reporting and knowledge search:** Summarize authorized campaign data and approved company materials with source references.
- **Rights and infringement analysis:** A later, higher-risk capability that may prioritize evidence for reviewers; it must never issue a takedown or make a legal determination automatically.

See [`docs/architecture/AI-ENGINEERING-ROADMAP.md`](../docs/architecture/AI-ENGINEERING-ROADMAP.md) for the repository audit, priorities, and implementation gates.

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
