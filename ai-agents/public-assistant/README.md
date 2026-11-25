# Public FAQ assistant and bounded agent mode

Issue #31 adds the first LLM-backed feature slice: an optional public FAQ assistant. It is not a general-purpose autonomous agent. The backend invokes one read-only FAQ retrieval tool, then makes one bounded OpenAI Responses API request using the retrieved public excerpts. The model cannot choose tools, browse the web, access CRM or tenant data, create leads, send messages, or mutate business records.

## Runtime boundaries

- The adapter implements the Application `ILanguageModelProvider` port and uses OpenAI's Responses API. Requests set `store=false`, but this does not by itself mean the provider retains no data; account eligibility, abuse-monitoring retention, and contractual terms still require approval.
- Model, API key, timeout, and output-token ceiling are backend configuration. The endpoint is fixed to HTTPS `api.openai.com/v1/responses`. Never put the key in React/Angular configuration, repository files, telemetry, prompts, or logs.
- Both `AI:PublicAssistant:Enabled` and `AI:OpenAI:Enabled` default to `false`. The React widget separately requires `VITE_PUBLIC_AI_ASSISTANT_ENABLED=true`.
- FAQ retrieval uses a small public-only draft corpus derived from existing public pages. Product owners must verify its wording/links before enabling the feature. It has English and Arabic terms, but bilingual answer quality still needs evaluation. No vector database, prior-turn context, tenant record, or arbitrary URL is read. Citations are created by the server from retrieved records rather than accepted from model text.
- Chat requests are limited to 500 characters; obvious email addresses and phone numbers are rejected. This is a protective check, not complete PII detection. The widget tells visitors not to enter personal or confidential data.
- Each call is bounded to at most four 3,000-character source excerpts and 400 generated tokens, and the endpoint uses the existing hashed distributed rate limiter (10 requests per minute per IP). Configure a provider-account spend cap/alert before enablement; global spend accounting is not implemented in this phase. Chat transcripts are not saved. If the provider is disabled, unavailable, slow, or returns invalid output, the endpoint fails closed and the UI offers the contact page.
- The public FAQ assistant does not automate CRM. A future service-request triage automation must persist a draft suggestion and audit trail and require staff accept/edit/reject before any workflow change.

## Local configuration

Keep both assistant flags off until product/security/privacy approve the provider terms, deployment region, retention behavior, user notice, and evaluation criteria. For OpenAI, configure the Responses API through .NET User Secrets locally or a managed secret store in deployment:

```powershell
dotnet user-secrets set "AI:PublicAssistant:Enabled" "true" --project backend/src/DigiSay.API
dotnet user-secrets set "AI:OpenAI:Enabled" "true" --project backend/src/DigiSay.API
dotnet user-secrets set "AI:OpenAI:Model" "<approved-model>" --project backend/src/DigiSay.API
dotnet user-secrets set "AI:OpenAI:ApiKey" "<secret>" --project backend/src/DigiSay.API
```

Build the public frontend with `VITE_PUBLIC_AI_ASSISTANT_ENABLED=true` and its existing `VITE_DIGISAY_API_BASE_URL` set to the API origin. Do not enable this flag in production before provider approval and the quality/safety evaluation pass. No production secret is included in this repository.

## Required follow-up before public rollout

- Replace the initial hand-curated FAQ snippets with product-reviewed, versioned source content and link targets.
- Run a reviewed gold-set evaluation covering grounding, abstention, prompt injection, unsupported/price questions, Arabic/English behavior, latency, and provider failures; agree pass thresholds before rollout.
- Approve the provider's region, retention/training terms, privacy notice, and operational alerting. Reconfirm the retention policy if transcripts or memory are added later.
- Review OpenAI API data controls and configure an eligible retention mode for the project. `store=false` prevents Responses API application-state storage, but does not automatically disable all abuse-monitoring retention.
- Add integration tests for endpoint feature-off behavior, rate limiting, model timeout, and front-end error states; run security review of the deployment proxy and origin allowlist.

The assistant is intentionally stateless and has no CRM or write-capable tool. Do not turn it into a multi-agent executor without a separate threat model, explicit per-tool authorization, durable audit, idempotency, and human approval design.
