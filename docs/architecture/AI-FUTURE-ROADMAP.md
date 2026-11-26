# AI future roadmap

The repository audit, feature gap inventory (including the public chatbot), phased recommendations, and release gates live in [`AI-ENGINEERING-ROADMAP.md`](AI-ENGINEERING-ROADMAP.md).

Current status: The provider-neutral service-request triage contract is merged, with an admin-only API endpoint that returns 503 until the provider is enabled and a dashboard control that is hidden unless `aiTriageEnabled` is set. Issue #31 adds a public FAQ widget, rate-limited API, retrieval workflow, and an optional server-side OpenAI Responses API adapter; all are disabled by default and no API key is configured. The initial FAQ text is draft pending product review. Firebase in React remains Analytics-only. The artist performance copilot is a separate, later Dashboard use case and is blocked on missing artist/catalog/revenue/platform/rights data models. An authenticated client-support assistant also requires support APIs and tenant/document authorization first.
