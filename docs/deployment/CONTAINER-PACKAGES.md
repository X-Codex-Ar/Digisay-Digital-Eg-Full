# GitHub Packages

## Container images

The `Publish container packages` workflow publishes the API, public site, and dashboard as separate GHCR packages after pushes to `main`, version tags (`v*.*.*`), or a manual workflow run.

Packages use these names:

- `ghcr.io/x-codex-ar/digisay-digital-eg-full/api`
- `ghcr.io/x-codex-ar/digisay-digital-eg-full/public`
- `ghcr.io/x-codex-ar/digisay-digital-eg-full/dashboard`

Each published image receives a source ref tag, a commit SHA tag, and `latest` for the default branch. The workflow uses the repository-scoped `GITHUB_TOKEN`; no registry password secret is required. Package visibility follows GitHub's package settings and may need to be changed to public in the package settings after its first successful publish.

Pull requests do not publish packages. Their builds and tests run through the existing CI quality gates.

## NuGet libraries

The `Publish NuGet packages` workflow publishes `DigiSay.Domain`, `DigiSay.Application`, and `DigiSay.Infrastructure` to the GitHub NuGet feed on pushes to `main`, version tags (`v*.*.*`), or a manual workflow run. The API executable is not packed as a library.

Pushes to `main` use unique prerelease versions (`1.0.0-main.<run number>`); version tags such as `v1.2.3` publish stable `1.2.3` packages. GitHub Actions uses its scoped `GITHUB_TOKEN` with `packages: write`, so no personal access token secret is needed.

Consumers can configure the feed with:

```sh
dotnet nuget add source "https://nuget.pkg.github.com/X-Codex-Ar/index.json" \
  --name digisay-github \
  --username YOUR_GITHUB_USERNAME \
  --password YOUR_GITHUB_TOKEN \
  --store-password-in-clear-text
```

Packages are private by default. Change visibility in each package's GitHub settings if they should be public.
