# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn install      # install dependencies (required after fresh clone — node_modules is not committed)
yarn start        # dev server at http://localhost:3000 with hot reload
yarn build        # production build into build/
yarn serve        # serve the production build locally
yarn typecheck    # TypeScript check without emitting files
```

Deploy to GitHub Pages (`gh-pages` branch):
```bash
GIT_USER=cocchialorenzo9 yarn deploy
```

## Architecture

This is a personal website built on **Docusaurus 2.2.0** (classic preset). Docs and blog features are disabled — the site is plain React pages.

The home page (`/`) and projects page (`/projects`) use a standalone design (light only, Bricolage Grotesque + Instrument Serif) and deliberately render **without** `@theme/Layout`, so the Docusaurus navbar/footer never appear on them. The app pages (`/projects/vibe-marathon`, `/home`, `/marathon`, …) still use `Layout` and the Docusaurus navbar.

### Key files

| File | Purpose |
|------|---------|
| `docusaurus.config.js` | Site metadata, navbar links for the app pages, GitHub Pages deployment config |
| `src/pages/index.tsx` | Home page — Hero, Marquee, About, Numbers, Strengths, Work, How I work, Life, Contact — driven by data arrays at the top of the file |
| `src/pages/index.module.css` | Home page section styles |
| `src/pages/projects/index.tsx` | Projects page, driven by the `PROJECTS` array (stats counters are derived from it) |
| `src/components/site/` | Shared shell for both pages: `SitePage` (head, fonts, Infima resets), `SiteNav`, `SiteFooter`, `SmartLink`, `tokens.ts` (palette), `site.module.css` |
| `src/css/custom.css` | Global Infima CSS variable overrides for the app pages (color palette, navbar always-dark) |
| `static/img/site/` | Images for the home and projects pages |
| `static/cv/Lorenzo_Cocchia_CV.pdf` | CV linked from the home page footer (public — keep personal phone number out of it) |

### How to update content

Home content lives in arrays near the top of `src/pages/index.tsx` (`ROLES`, `BITS`, `MARQUEE`, `TIMELINE`, `LOGOS`, `NUMBERS`, `STRENGTHS`, `WORK`, `STEPS`, `LIFE`, `CONTACT`). Projects live in `PROJECTS` in `src/pages/projects/index.tsx`; set `featured: true` for the big card, `status` to `'live'` or `'in-progress'` (a zero counter is hidden), and `cta` to override the card's "Open app" label.

### Color palette

Home/projects: ink `#141414`, paper `#F6F5F1`, accent blue `#2D46F5`, orange `#FF5B2E`, plus pastel chips. `src/components/site/tokens.ts` holds the colors used from TSX (inline styles); the CSS modules hard-code the same hexes. The CSS minifier can reorder rules in these modules, so overrides of a same-specificity rule must use a compound selector (e.g. `.stop.stopCurrent`).

App pages: light green theme, primary `#22c55e` (light mode) / `#4ade80` (dark mode). The navbar is always dark (`#0f172a`) regardless of color mode, controlled in `src/css/custom.css`.

### Reports (`static/reports/`)

Every report hosted in `static/reports/` must include a clickable link for each product row pointing to the product's actual page on the retailer's website. Where no direct product page is available, link to the closest category or search page on that retailer. Links must open in a new tab (`target="_blank" rel="noopener noreferrer"`). Never leave a product row with no link.
