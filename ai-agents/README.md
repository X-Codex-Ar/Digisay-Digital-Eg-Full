# DigiSay AI Agents & Intelligence Services

This folder is reserved for autonomous AI agent workflows, generative tools, and intelligent media operations supporting DigiSay's business capabilities.

## Scope & Purpose

- **RightsHero Automated Protection Agents:** Intelligent scanning and classification agents to detect copyright infringements, pirate streams, and unauthorized digital asset usage.
- **Content Production & Categorization Agents:** Automated metadata generation, multi-lingual tagging, transcript processing, and studio asset workflow automation.
- **Marketing & Influencer Intelligence:** Campaign performance analytics, influencer audience verification, and automated outreach analysis.
- **Inquiry Triage & Customer Support:** Intelligent classification and routing of public inquiries received via `public` and `dashboard`.

## Roles & Developer Responsibilities

### AI / Agentic Systems Engineer
- Author and evaluate prompt templates, agentic tools, and multi-agent orchestration frameworks.
- Implement token budgets, rate limits, model fallback strategies, and cost-control telemetry.
- Enforce data privacy, tenant isolation, and strict PII redaction before passing payloads to LLM providers.
- Provide clean API interfaces or message broker connectors (e.g. RabbitMQ/Outbox) for integration with `backend/`.

### Backend & Frontend Developers
- Ensure agent triggers and results respect existing Clean Architecture boundaries in `backend/src/DigiSay.Application`.
- Never execute irreversible actions (e.g. legal takedown notices or billing changes) without human-in-the-loop review in `dashboard/`.
