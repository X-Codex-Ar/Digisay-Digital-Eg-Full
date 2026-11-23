# Public website

This is the existing DigiSay React 19 application, moved to the repository's root `public/` folder as part of the monorepo layout. Its TanStack Start SSR setup, file-based routes, Tailwind v4 design system, features, and Vitest coverage are retained. Vite-served static assets are in `public/static/`; the Vite configuration explicitly points there.

Run from the repository root with `pnpm run dev:public`, `pnpm run test:public`, or `pnpm run build:public`. The root scripts delegate to this app. Its dependencies and pnpm lockfile live here; the root has no shared `node_modules` folder.

## Existing motion and interaction notes

A high-performance digital media platform engineered for **DigiSay Group**, the premier digital media solutions and content protection leader across the Middle East, North Africa, and global creator ecosystems.

Built with **React 19**, **TanStack Start**, **TanStack Router**, **Tailwind CSS v4**, and cinematic **Motion (Framer Motion)** animations inspired by modern award-winning design systems ([motionsites.ai](https://motionsites.ai)).

---

## ✦ Motion & Interaction Architecture

The platform features modern programmatic web animations and micro-interactions designed to elevate user engagement without sacrificing responsiveness or accessibility:

### 1. Brand Opening Screen Animation (`BrandIntroLoader.tsx`)
- Displays an opening brand sequence upon landing featuring the DigiSay monogram, an ambient brand crimson glow (`#d90a2c`), typography reveal, and a precision progress bar (0% → 100%).
- Gracefully curtain-exits into the interface with smooth cubic-bezier easing.
- Uses `sessionStorage` to avoid redundant replay on subsequent internal page navigations.

### 2. Global Scroll Progress Line (`ScrollProgressBar.tsx`)
- Pinned to the top edge of the viewport (`fixed top-0 inset-x-0 z-[60] h-[3px]`).
- Smoothly tracks document scroll progress with spring physics in DigiSay Brand Red (`#d90a2c` to `#ff3b56`).

### 3. Magnetic Physics Buttons (`Magnetic.tsx`, `PrimaryButton.tsx`, `SecondaryButton.tsx`)
- Interactive buttons track nearby cursor coordinates and pull toward the cursor using spring physics (`stiffness: 150, damping: 15`).
- On mouse leave, buttons smoothly snap back to neutral position.
- Includes subtle brand red gradient flares and directional icon nudges on hover.

### 4. Hero Section with Mouse-Following Atmosphere (`HeroSection.tsx`)
- **Word-by-Word Slide In:** The primary headline (*"The Digital Media Solutions Leader"*) reveals sequentially word-by-word with masked overflow containers.
- **Interactive Ambient Glows:** Multi-layered radial gradients follow cursor movement with spring physics.
- **Scroll-Linked Shrink & Fade:** The entire hero smoothly scales down (`scale: 1 → 0.91`) and fades out (`opacity: 1 → 0.1`) as the user scrolls into the content.

### 5. Velocity Marquee & Reading Reveal (`CompanyIntroSection.tsx`)
- **Velocity-Responsive Ticker:** A continuous marquee of service disciplines that dynamically accelerates and **tilts (skews up to ±10°)** based on real-time scroll velocity.
- **Word-by-Word Reading Light-Up:** Agency narrative text starts dimmed and illuminates word by word as the reader scrolls down.

### 6. Sticky Stacked Cards (`ServicesOverviewSection.tsx`)
- Replaces standard grids with physical card stacking mechanics.
- Each service card sticks at calculated offsets (`top: calc(88px + index * 20px)`), allowing subsequent cards to stack smoothly on top with subtle scaling and drop-shadow depth.

### 7. Horizontal Scroll Pinning Process (`WorkflowSection.tsx`)
- Section vertically locks in place while the user scrolls through a 280vh track.
- The 4 methodology milestone cards slide horizontally across the screen.
- Integrated interactive progress bar highlights active steps in real-time.

### 8. 3D Perspective Tilt Stats (`StatsSection.tsx`)
- Metric counters trigger cubic-eased count-up animations upon entering the viewport.
- Cards calculate real-time 3D perspective rotation (`perspective: 1000px`, `rotateX`, `rotateY`) matching mouse coordinates, paired with dynamic specular light glare reflection.

### 9. Scroll-Driven Growth Call-To-Action (`ContactSection.tsx`)
- Deep obsidian and crimson-bordered container that scales up (`scale: 0.86 → 1.0`) as scrolled into view.
- Accompanied by direct communication links and a magnetic contact trigger.

---

## ✦ Design System & Brand Identity

- **Brand Primary Red:** `#d90a2c` (DigiSay Signature Red)
- **Neutral Obsidian Palette:** `#090a0d`, `#111215`, `#1c080b`
- **Typography:** DM Sans (`--font-sans`)
- **Responsive Scrollbar:** Ultra-slim, rounded brand red scrollbar with smooth hover states.
- **SVG Social Icons:** Clean, vector brand icons for LinkedIn, Twitter / X, Facebook, and Instagram (`SocialIcons.tsx`).
- **Accessible & Reduced Motion:** Full compliance with `prefers-reduced-motion` across all motion components.

---

## ✦ Project Structure

```text
├── public/
│   ├── assets/              # Brand logos, partners, awards, services assets
│   ├── favicon.png          # High-resolution DigiSay brand icon
│   └── favicon.ico          # Browser favicon
├── src/
│   ├── components/
│   │   ├── common/          # Magnetic, BrandIntroLoader, ScrollProgressBar, SocialIcons
│   │   ├── layout/          # SiteHeader, SiteFooter, DesktopNav, MobileNav
│   │   └── ui/              # Radix UI primitives (Select, Sheet, Accordion, etc.)
│   ├── data/                # Typed site data, navigation, services, blogs
│   ├── features/
│   │   ├── home/            # Hero, Services, Intro, Workflow, Stats, CTA sections
│   │   ├── services/        # Service detail pages & overview
│   │   ├── about/           # About & Companies ecosystem
│   │   ├── contact/         # Contact page, form with Radix select, direct lines
│   │   └── blog/            # Blog listing and individual post detail pages
│   ├── lib/                 # Error reporting, utilities, routing setup
│   ├── routes/              # TanStack Start file-based routing
│   └── styles.css           # Tailwind v4 configuration, brand tokens, and scrollbars
```

---

## ✦ Getting Started

### Prerequisites
- Node.js 20+
- pnpm

### Installation
```sh
npm install
```

### Development
```sh
npm run dev
```
The development server will be available at `http://localhost:8080/`.

### Production Build
```sh
npm run build
```

### Test Suite
```sh
npm run test
```

---

© DigiSay Group. All rights reserved.
