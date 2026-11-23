# API conventions

The API uses URL-segment versioning. `GET /api/v1/health` is process liveness, `/health/ready` checks configured database dependencies, and `POST /api/v1/contact-inquiries` validates and persists public contact inquiries. The contact endpoint returns 201 on persistence, 400 for invalid fields, and 429 when its per-IP rate limit is exceeded. The API uses ProblemDetails for unhandled errors and serves OpenAPI only in Development. Future business endpoints need explicit DTOs, validation, status/paging/filtering contracts, and authorization; never return EF entities.
