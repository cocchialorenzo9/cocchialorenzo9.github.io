# cocchialorenzo9.github.io

Personal portfolio and live project dashboards, built with [Docusaurus 2](https://docusaurus.io/).

Live at [cocchialorenzo9.github.io](https://cocchialorenzo9.github.io).

## Pages

| Route | Description |
|---|---|
| `/` | Portfolio home |
| `/marathon` | Munich Marathon 2026 training plan |
| `/projects` | Live project dashboards |
| `/projects/vibe-marathon` | Marathon preparation dashboard (readiness, training load, charts) |

## Development

```bash
yarn install
yarn start        # dev server at http://localhost:3000
yarn build        # production build → ./build
```

## Deployment

Automatic. Any push to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`), which runs `yarn build` and deploys to GitHub Pages.

## Adding a new project dashboard

1. Create `src/pages/projects/<slug>.jsx` — follow `vibe-marathon.jsx` as a template.
2. Add a card for it in `src/pages/projects/index.jsx` (the `PROJECTS` array).
3. The route `/projects/<slug>` is live automatically — no routing config needed.
