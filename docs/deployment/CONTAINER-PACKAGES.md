# GitHub Packages

## Container images

The `Release` workflow watches pushes to `main` and creates or updates a Release PR from Conventional Commits. Merging that PR creates a version tag (`vX.Y.Z`) and GitHub Release. The release workflow then calls the container and NuGet publisher workflows with the same stable version. This explicit workflow call is required because tags created with `GITHUB_TOKEN` do not start separate tag-push workflows. In repository settings, allow GitHub Actions to create pull requests so Release Please can open the Release PR.

The `Publish container packages` workflow publishes the API, public site, and dashboard as separate GHCR packages for each stable release. Each image receives `X.Y.Z`, `X.Y`, `X`, `latest`, and a commit SHA tag. You can also run the workflow manually with a stable SemVer version, or push a `vX.Y.Z` tag.

Packages use these names:

- `ghcr.io/x-codex-ar/digisay-digital-eg-full/api`
- `ghcr.io/x-codex-ar/digisay-digital-eg-full/public`
- `ghcr.io/x-codex-ar/digisay-digital-eg-full/dashboard`

The workflow uses the repository-scoped `GITHUB_TOKEN`; no registry password secret is required. Package visibility follows GitHub's package settings and may need to be changed to public in the package settings after its first successful publish.

Pull requests do not publish packages. Their builds and tests run through the existing CI quality gates.

## NuGet libraries

The `Publish NuGet packages` workflow publishes `DigiSay.Domain`, `DigiSay.Application`, and `DigiSay.Infrastructure` to the GitHub NuGet feed for each stable release. The API executable is not packed as a library. You can also run the workflow manually with a stable SemVer version, or push a `vX.Y.Z` tag.

NuGet package versions match the GitHub Release exactly (for example, tag `v1.2.3` publishes package version `1.2.3`). GitHub Actions uses its scoped `GITHUB_TOKEN` with `packages: write`, so no personal access token secret is needed.

## Versioning and changelog

Use Conventional Commit messages so Release Please can choose the next version and build the changelog: `fix:` bumps the patch, `feat:` bumps the minor, and a breaking change (`!` or a `BREAKING CHANGE:` footer) bumps the major. Other commit types do not trigger a release unless marked as breaking. Release Please opens or updates a Release PR; maintainers review and merge it to publish the GitHub Release and packages. The initial release baseline is `1.0.0`.

Consumers can configure the feed with:

```sh
dotnet nuget add source "https://nuget.pkg.github.com/X-Codex-Ar/index.json" \
  --name digisay-github \
  --username YOUR_GITHUB_USERNAME \
  --password YOUR_GITHUB_TOKEN \
  --store-password-in-clear-text
```

Packages are private by default. Change visibility in each package's GitHub settings if they should be public.
