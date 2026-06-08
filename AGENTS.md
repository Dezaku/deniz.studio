# deniz.studio — AGENTS.md

## Stack
- **Astro 6** + **React 19** (via `@astrojs/react`), TypeScript (strict), CSS scoped in Astro components
- Deployed to **GitHub Pages** at `deniz.studio` (custom domain via `public/CNAME`)
- Analytics via **Databuddy** (inline script in `index.astro`, plus `src/utils/tracking.ts`)

## Commands
| Action | Command |
|--------|---------|
| Dev server | `npm run dev` (localhost:4321) |
| Build | `npm run build` (outputs to `dist/`) |
| Preview | `npm run preview` |
| Astro CLI | `npm run astro` |

No test, lint, formatter, or typecheck scripts configured — do not run them.

## Deploy
- CI in `.github/workflows/deploy.yml` — pushes to `main` trigger a GitHub Pages deploy via `withastro/action`

## Architecture
- **Pages** (file-based routing): `src/pages/index.astro` (home), `imprint.astro`, `privacy.astro`, `photography.astro`
- **Components**: mix of `.astro` (Projects, Testimonials, Tools) and `.tsx` React (TestimonialsTwo)
- **Images**: imported via ESM and rendered with `Image` from `astro:assets`; source files in `src/images/` (32 images)
- **Fonts**: General Sans (home page) / Inter Variable (subpages) — both in `public/fonts/`
- **Config**: `astro.config.mjs` sets `site: 'https://deniz.studio'` — do not change (affects OG URLs, sitemap)
- **Case study link**: hardcoded Figma URL at `src/pages/index.astro:10` — update as needed
- **Favicons**: light/dark variants in `public/` with JS switcher in `index.astro`
- **style.css** is referenced in `index.astro` `<link>` but the file does not exist in `public/` — likely intentional (Astro may serve it or it's a dead reference)

## Quirks
- No component library or CSS framework — everything is hand-written scoped `<style>` blocks
- `src/utils/tracking.ts` exports typed track helpers but the actual tracker script is loaded inline on the home page only
- `tsconfig.json` extends `astro/tsconfigs/strict` with `jsx: "react-jsx"` for React
- `package.json` has empty `"name": ""` field — Astro default template artifact
