# AI future roadmap

The repository audit, feature gap inventory (including the public chatbot), phased recommendations, and release gates live in [`AI-ENGINEERING-ROADMAP.md`](AI-ENGINEERING-ROADMAP.md).

Current status: the current feature branch has a provider-neutral service-request triage contract and use case pending PR review. No provider SDK is configured, no inference endpoint or chatbot exists, and no model is called at runtime. Firebase in the React app is used for Analytics only. The first recommended user-facing pilot is a read-only public FAQ chatbot backed only by curated, approved public sources; an authenticated client-support chatbot requires the missing support APIs and tenant/document authorization first.
