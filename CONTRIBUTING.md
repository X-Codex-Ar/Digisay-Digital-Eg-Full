# Contributing to DigiSay

This repository holds three apps: the React public site (`public/`), the Angular dashboard (`dashboard/`) and the ASP.NET Core API (`backend/`). Start with the [README](README.md) for local setup.

## Before you open a pull request

Every pull request into `main` must pass these three required checks. Run the same commands locally first (they match `.github/workflows/ci.yml`). You need Node 22.22.3 or newer, pnpm 12.14.0 (the `packageManager` version) and the .NET SDK pinned in `global.json`.

Commands:

```powershell
# Public React
pnpm --dir public run lint
pnpm --dir public run test
pnpm --dir public run build

# Angular Dashboard
pnpm --dir dashboard run test --watch=false
pnpm --dir dashboard run build

# Backend .NET 10
dotnet restore backend/DigiSay.sln --locked-mode
dotnet build backend/DigiSay.sln --configuration Release --no-restore
dotnet test backend/DigiSay.sln --configuration Release --no-build --no-restore
```

The backend integration tests need SQL Server and Redis. CI starts both as services and sets `TEST_SQLSERVER_CONNECTION_STRING` and `TEST_REDIS_CONNECTION_STRING`; set the same variables to run them locally. If they are skipped on your machine, say so in the pull request; CI runs them.

## Branches, commits and pull requests

- Branch from the latest `main`. Keep one concern per pull request.
- Write short, descriptive commit titles, for example `feat(crm): add lead engagement history` or `fix(storage): return 404 for unknown objects`. Keep commits atomic.
- Link the issue the pull request completes with `Closes #N` in the description. Only use it when the issue's acceptance criteria are actually met.
- Say in the description what you tested and what you did not.
- Review is requested automatically from the code owners in `.github/CODEOWNERS` and from the area reviewers set by the triage workflow. Address review comments with code changes or a clear reply.

## Rules for specific areas

- **Database:** a pull request may add an EF Core migration but must not apply it to a shared or production database. Migrations are applied only by an explicit, reviewed step (see the README and `docs/development/DOCKER.md`).
- **AI features:** the public assistant and triage features are disabled by default. Do not commit API keys, enable a provider or call external inference in tests; use fakes. Provider activation gates are in `docs/architecture/AI-ENGINEERING-ROADMAP.md`.
- **Secrets:** never commit credentials. Use `.env.example` files and user secrets as the README describes.
- **Docs:** update the relevant file under `docs/` when a change alters an API contract, configuration or architecture decision.

## Crediting co-authors

Use a `Co-authored-by` trailer only for people who contributed to the change. Reviewing alone is not co-authoring. Put the trailers in one message paragraph, separated from the title. GitHub credits a trailer when its email is linked to the person's GitHub account. The trailers below use each account's numeric ID and login in GitHub's `ID+login@users.noreply.github.com` form, as read from the public profiles.

```bash
git commit -m "Add CRM follow-ups feature" -m "Co-authored-by: Mahmoud Safwat <270499350+dev-saffo@users.noreply.github.com>
Co-authored-by: Hala Mohamed <271031974+eng-loola@users.noreply.github.com>
Co-authored-by: mohammed-hossam <291595989+eng-hamo@users.noreply.github.com>
Co-authored-by: Ryan Bash <283229028+dev-elbasha@users.noreply.github.com>
Co-authored-by: Shaimaa Amer <276740498+eng-shimo@users.noreply.github.com>
Co-authored-by: Samir Akram <244368194+samir-akram@users.noreply.github.com>
Co-authored-by: Tarek Ashraf <249129379+eng-teto@users.noreply.github.com>
Co-authored-by: X Code Ar <340948699+x-code-ar@users.noreply.github.com>"
```

Trim the list to the people who worked on the change.

## Reporting a security problem

See [SECURITY.md](SECURITY.md).
