# Digisay Website Rebuild — Multi-Page Plan

Rebuild the full public site, not just the homepage: 10 separate pages, each with its own URL, title and share preview.

## Pages
| Page | URL |
|---|---|
| Home | / |
| About | /about |
| Services | /services |
| Anti-Piracy | /anti-piracy |
| Content Production | /content-production |
| Content Management | /content-management |
| Social Media | /social-media |
| Growth Marketing | /growth-marketing |
| Contact | /contact |
| Privacy Policy | /privacy-policy |

## Steps
1. Fetch every page above from digisay.com and extract text (headings, paragraphs, stats, process steps, services, contact info, footer, social links) plus images and logos.
2. Upload extracted images to the project's asset storage (no linking to the original site), and record them in an asset manifest.
3. Build the design system from the original: colors, fonts, spacing, buttons, cards, in light/dark tokens.
4. Shared layout: sticky header with nav + services dropdown, mobile menu, footer, scroll-to-top button.
5. Build each page from reusable sections (hero, services grid, animated counters, process steps, CTA band, contact form).
6. Contact form with validation (name, email, phone, message) showing a success message — frontend only, no sending.
7. Smooth scroll-in and counter animations; fully responsive; custom 404 page.
8. Verify every page in the browser at desktop and mobile sizes.

## Technical details
- Framework stays TanStack Start (the brief's React Router is replaced by the project's fixed router); one route file per page under src/routes with its own head() metadata.
- Content stored as typed data in src/data/* (navigation, services, stats, process, company, contact, footer, pages); components read from data.
- Sections in src/components/sections, layout in src/components/layout; header/footer mounted in __root.tsx.
- Motion (framer-motion) for animations; react-hook-form + zod for the form.
- Images via lovable-assets pointers under src/assets/<category>/; missing assets documented and given a fallback.
- No backend, database or login.
