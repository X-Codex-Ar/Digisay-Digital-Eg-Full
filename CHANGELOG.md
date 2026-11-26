# Changelog

## [1.3.0](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/compare/v1.2.0...v1.3.0) (2026-11-26)


### Features

* **dashboard:** add aiTriageEnabled runtime flag ([ea4b7f4](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/ea4b7f443d9f0d4562bc193cb8cf7ccb6f52d006))
* **dashboard:** add aiTriageUiEnabled helper ([9bda80e](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/9bda80ec2e8025abe124cb113e0cccf18a40886a))


### Bug Fixes

* **dashboard:** guard AI triage handler when flag is off ([1b25b18](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/1b25b181c5aadb74d0d169f41d56b5f9b7e9dcc9))
* **dashboard:** hide AI triage control unless explicitly enabled ([2259a62](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/2259a628f516ab194418a6d652fd2c4e73fb7b36))
* **dashboard:** render AI triage control only when enabled ([86e76dd](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/86e76dd757189b2f8423b3a4e6c64024110de4ae))

## [1.2.0](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/compare/v1.1.0...v1.2.0) (2026-11-26)


### Features

* **crm:** add lead engagement history and list filters ([68b5739](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/68b57398566959fe100593661f4454f46f3160b3))

## 1.1.0 (2026-11-25)

### Features
- Add disabled-by-default AI features and automated release workflows (#28).
- Add analytics consent controls (#36).
- Store private-object metadata with organization and uploader ownership, and add scoped storage access (#43).

### Fixes
- Return a usable Location when creating organizations (#42).
- Fix analytics consent checks and initialization races.

This is the first published release. Database migrations are included but have not been applied by this release process. AI features remain disabled by default.
