# DigiSay Developer Guidelines

## Architecture & Code Standards
- **Framework:** TanStack Start & React 19.
- **Routing:** TanStack Router with file-based routing in `src/routes`.
- **Styling:** Tailwind CSS v4 with design tokens defined in `src/styles.css`.
- **Motion & Interactions:** Programmatic motion with `motion/react` adhering to `prefers-reduced-motion`.
- **Brand Palette:** DigiSay Brand Red (`#d90a2c`) with dark obsidian accents and clean neutrals.
- **Components:** Modular structure under `src/features/*` and `src/components/*`.

## Repository layout
- `public/`: the React public site (TanStack Start). The architecture and styling notes above apply to this app.
- `dashboard/`: Angular dashboard.
- `backend/`: ASP.NET Core API on .NET 10 with Clean Architecture; SQL Server is the system of record.

## Workflow
- Use pnpm, not npm. Run checks in the app you changed, as in `CONTRIBUTING.md`:
  - Public: `pnpm --dir public run lint`, `pnpm --dir public run test`, `pnpm --dir public run build`
  - Dashboard: `pnpm --dir dashboard run test --watch=false`, `pnpm --dir dashboard run build`
  - Backend: `dotnet restore backend/DigiSay.sln --locked-mode`, `dotnet build backend/DigiSay.sln --configuration Release --no-restore`, `dotnet test backend/DigiSay.sln --configuration Release --no-build --no-restore`
- Do not apply migrations to shared or production databases. Keep AI features disabled by default and use fakes in tests.
- Keep commits atomic and descriptive. See `CONTRIBUTING.md`.
