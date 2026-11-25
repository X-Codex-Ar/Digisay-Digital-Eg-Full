# Changelog

## 1.1.0 (2026-11-25)

### Features
- Add disabled-by-default AI features and automated release workflows (#28).
- Add analytics consent controls (#36).
- Store private-object metadata with organization and uploader ownership, and add scoped storage access (#43).

### Fixes
- Return a usable Location when creating organizations (#42).
- Fix analytics consent checks and initialization races.

This is the first published release. Database migrations are included but have not been applied by this release process. AI features remain disabled by default.
