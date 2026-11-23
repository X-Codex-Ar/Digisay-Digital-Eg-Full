# DigiSay DevOps & Infrastructure

This folder is reserved for DigiSay platform infrastructure, deployment pipelines, container specifications, and cloud operations.

## Scope & Purpose

- **Containerization:** Production and local multi-service Dockerfiles and Docker Compose definitions for `public`, `dashboard`, `backend`, and `database`.
- **CI/CD Pipelines:** Automated build, test, lint, and security analysis workflows (e.g. GitHub Actions) triggering on pull requests and deployments.
- **Environment Management:** Configuration templates, staging, and production environment orchestration.
- **Observability & Monitoring:** Centralized logging, metrics collection, health check alerting, and telemetry integration.

## Roles & Developer Responsibilities

### DevOps / Platform Engineer
- Maintain infrastructure as code (IaC) templates and Docker configurations.
- Ensure strict separation of environment secrets (using Azure Key Vault, AWS Secrets Manager, or GitHub Secrets); never commit credentials.
- Target .NET 10 LTS container images when modernizing the backend API container.
- Configure SSL/TLS termination, rate limiting, and reverse proxy rules (e.g. Nginx, Cloudflare) protecting `public`, `dashboard`, and `backend`.

### Full-Stack / Application Developers
- Ensure local dev containers or Compose setups mirror production dependencies without breaking independent development workflows (`pnpm run dev`).
- Keep environment variable documentation (`.env.example`) up to date when introducing new runtime configurations.
