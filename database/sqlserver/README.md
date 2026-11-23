# SQL Server schema

Apply numbered scripts in order after reviewing them against the target environment. Scripts are additive and guarded for repeat execution. The API intentionally does not call `EnsureCreated`, auto-migrate, or mutate production schemas at startup.

`ContactInquiries` stores only fields submitted through the public contact form plus a UTC creation time and source IP for abuse investigation. Restrict access to authorized operations staff, avoid copying inquiry text into logs, and delete or anonymize records after 180 days unless a documented legal or business need requires a different period.
