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

This is a single-page personal website built on **Docusaurus 2.2.0** (classic preset). Docs and blog features are disabled — the site is a plain React page.

### Key files

| File | Purpose |
|------|---------|
| `docusaurus.config.js` | Site metadata, navbar links (Email / LinkedIn / GitHub), GitHub Pages deployment config |
| `src/pages/index.tsx` | Entire site content — Hero, Experience, Skills, Education, Publications sections, all driven by inline data arrays at the top of the file |
| `src/pages/index.module.css` | All layout and component styles scoped to the homepage |
| `src/css/custom.css` | Global Infima CSS variable overrides (color palette, navbar always-dark) |

### How to update CV content

All CV data lives as TypeScript arrays (`EXPERIENCE`, `SKILLS`, `EDUCATION`, `PUBLICATIONS`) near the top of `src/pages/index.tsx`. Edit those arrays — no other file needs to change for content updates.

### Color palette

Light green theme: primary `#22c55e` (light mode) / `#4ade80` (dark mode). The navbar is always dark (`#0f172a`) regardless of color mode, controlled in `src/css/custom.css`.

### Reports (`static/reports/`)

Every report hosted in `static/reports/` must include a clickable link for each product row pointing to the product's actual page on the retailer's website. Where no direct product page is available, link to the closest category or search page on that retailer. Links must open in a new tab (`target="_blank" rel="noopener noreferrer"`). Never leave a product row with no link.
