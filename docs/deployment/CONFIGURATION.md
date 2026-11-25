# Configuration inventory

Supply secrets through .NET User Secrets for local API development and managed environment variables in deployment. Do not put secret values in source files, migrations, browser bundles, or this document. ASP.NET environment variable names use double underscores in place of `:`.

## API

| Setting name | Source | Required when | What breaks without it |
| --- | --- | --- | --- |
| `ASPNETCORE_ENVIRONMENT` | Deployment/runtime environment | Optional | Defaults to Production. Controls Development-only fallbacks such as in-process rate limiting and unavailable private Storage. |
| `ASPNETCORE_URLS` | Deployment/runtime environment | Optional | Defaults to the ASP.NET host binding; an incorrect binding can keep the API unreachable. |
| `ConnectionStrings:SqlServer` | User Secrets / `ConnectionStrings__SqlServer` environment variable | Always | API startup fails; SQL Server is the authoritative business store. |
| `ConnectionStrings:SupabasePostgres` | User Secrets / `ConnectionStrings__SupabasePostgres` environment variable | Optional | No Supabase Postgres readiness check runs. If set incorrectly, readiness reports that dependency as unhealthy. |
| `RateLimiting:RedisConnectionString` | `RateLimiting__RedisConnectionString` environment variable | Every non-Development environment | Startup fails outside Development; when unavailable, rate-limited calls return 503. Development uses an in-process store if omitted. |
| `RateLimiting:KeyHashSecret` | User Secrets / `RateLimiting__KeyHashSecret` environment variable | Always; 32 UTF-8 bytes minimum | Startup validation fails. Development supplies a fixed development-only fallback when omitted. |
| `ForwardedHeaders:KnownProxies:{index}` | Deployment environment variable, for example `ForwardedHeaders__KnownProxies__0` | Optional, only when behind trusted proxies | Forwarded IP/protocol headers are ignored; configure only controlled proxies. |
| `ForwardedHeaders:KnownNetworks:{index}` | Deployment environment variable, for example `ForwardedHeaders__KnownNetworks__0` | Optional, only when behind trusted proxy networks | Forwarded headers from that network are ignored. |
| `ForwardedHeaders:ForwardLimit` | Deployment environment variable | Optional | Defaults to one trusted proxy hop; invalid values outside 1–10 stop startup. |
| `Cors:AllowedOrigins:{index}` | Deployment environment variable or configuration provider | Optional | Built-in localhost origins are used; deployed browser clients from other origins cannot call the API. |
| `Email:Smtp:Host` | User Secrets / `Email__Smtp__Host` environment variable | Non-Development, or whenever SMTP is enabled in Development | Non-Development startup fails. In Development with no SMTP, confirmation/recovery links are written to logs instead of sent. |
| `Email:Smtp:Port` | User Secrets / `Email__Smtp__Port` environment variable | With SMTP | Defaults to the configured option default; invalid port fails startup. |
| `Email:Smtp:UserName` | User Secrets / `Email__Smtp__UserName` environment variable | With SMTP | Startup validation fails; mail authentication cannot work. |
| `Email:Smtp:Password` | User Secrets / `Email__Smtp__Password` environment variable | With SMTP | Startup validation fails; mail authentication cannot work. |
| `Email:Smtp:FromAddress` | User Secrets / `Email__Smtp__FromAddress` environment variable | With SMTP | Startup validation fails; messages have no valid sender. |
| `Identity:BootstrapAdminSecret` | One-time User Secret / `Identity__BootstrapAdminSecret` environment variable | Only while bootstrapping the first SuperAdmin | The one-time bootstrap endpoint stays unavailable. Remove it after successful bootstrap. |
| `Storage:Supabase:ProjectUrl` | User Secrets / `Storage__Supabase__ProjectUrl` environment variable | Non-Development; in Development only when enabling real storage | Non-Development startup fails. In Development with both storage credentials omitted, private storage returns unavailable. |
| `Storage:Supabase:SecretKey` | User Secrets / `Storage__Supabase__SecretKey` environment variable | Non-Development; in Development only when enabling real storage | Non-Development startup fails. This server-only key must never enter a frontend build. |
| `Storage:Supabase:PrivateBucket` | User Secrets / `Storage__Supabase__PrivateBucket` environment variable | Optional; set to the bucket provisioned by `storage/supabase/001_storage_buckets.sql` | Defaults to `digisay-private`; a mismatch makes Storage requests fail. |
| `AI:PublicAssistant:Enabled` | Configuration provider / `AI__PublicAssistant__Enabled` environment variable | Optional; enable only after product review | Defaults off; the public assistant endpoint remains unavailable. |
| `AI:OpenAI:Enabled` | User Secrets / `AI__OpenAI__Enabled` environment variable | Optional; only when approved | Defaults off; no model inference occurs. |
| `AI:OpenAI:Endpoint` | Configuration / `AI__OpenAI__Endpoint` environment variable | When OpenAI is enabled | Enabled-provider startup validation fails unless it is the approved HTTPS Responses API endpoint. |
| `AI:OpenAI:Model` | Configuration / `AI__OpenAI__Model` environment variable | When OpenAI is enabled | Enabled-provider startup validation fails; requests cannot select a model. |
| `AI:OpenAI:ApiKey` | User Secrets / `AI__OpenAI__ApiKey` environment variable | When OpenAI is enabled | Enabled-provider startup validation fails; authenticated provider calls cannot be made. |
| `AI:OpenAI:TimeoutSeconds` | Configuration / `AI__OpenAI__TimeoutSeconds` environment variable | Optional | Defaults to the bounded provider timeout. Invalid enabled values fail validation. |
| `AI:OpenAI:MaximumOutputTokens` | Configuration / `AI__OpenAI__MaximumOutputTokens` environment variable | Optional | Defaults to the bounded output limit. Invalid enabled values fail validation. |
| `TEST_SQLSERVER_CONNECTION_STRING` | Local test environment / CI secret | Required only for API integration tests | The SQL Server integration suite cannot create its unique disposable databases. Never point it at a shared or production database. |

## Public React and Angular

| Setting name | Source | Required when | What breaks without it |
| --- | --- | --- | --- |
| `VITE_DIGISAY_API_BASE_URL` | Public build environment | Optional; required if the API is not same-origin in production | Public contact and assistant requests target the wrong origin or fail. Development falls back to localhost. |
| `VITE_PUBLIC_AI_ASSISTANT_ENABLED` | Public build environment | Optional; must be enabled with API assistant configuration | Defaults off; the public assistant widget is hidden. |
| `window.digisayRuntimeConfig.apiBaseUrl` | `dashboard/public/runtime-config.js` deployment runtime configuration | Required when the API is not at the dashboard's built-in development origin | Dashboard API requests use the wrong origin or fail. |
| `window.digisayRuntimeConfig.publicBaseUrl` | `dashboard/public/runtime-config.js` deployment runtime configuration | Required when dashboard assistant links should point to a deployed public site | Assistant links use the built-in development fallback. |
| `window.digisayRuntimeConfig.storageBaseUrl` | Optional dashboard runtime configuration | Optional; only used for public storage URL resolution | Public media URL resolution has no configured remote base. Private API files are not accessed through this setting. |

Firebase Analytics uses public web configuration currently defined in `public/src/lib/firebase.ts`; the source currently uses code constants rather than environment settings. The web configuration names are `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`, and `measurementId`. They are client identifiers, not server secrets. No Firebase Auth, Firestore, FCM, or Admin configuration is active. The optional FCM proposal and its future setting names are documented in [`FIREBASE-INTEGRATION.md`](../integrations/FIREBASE-INTEGRATION.md); they are not active configuration. Moving web values into frontend environment settings is a public-site owner change and is not included here.

The outbox currently needs no separate setting. Its SQL table is created by the reviewed EF migration; a real external publisher remains a code-owned integration adapter and must be configured before any cross-store projection is enabled.
