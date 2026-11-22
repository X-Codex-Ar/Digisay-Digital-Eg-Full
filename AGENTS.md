# DigiSay Developer Guidelines

## Architecture & Code Standards
- **Framework:** TanStack Start & React 19.
- **Routing:** TanStack Router with file-based routing in `src/routes`.
- **Styling:** Tailwind CSS v4 with design tokens defined in `src/styles.css`.
- **Motion & Interactions:** Programmatic motion with `motion/react` adhering to `prefers-reduced-motion`.
- **Brand Palette:** DigiSay Brand Red (`#d90a2c`) with dark obsidian accents and clean neutrals.
- **Components:** Modular structure under `src/features/*` and `src/components/*`.

## Workflow
- Test and build verification:
  - `npm run build`
  - `npm run test`
- Keep commits atomic and descriptive.
