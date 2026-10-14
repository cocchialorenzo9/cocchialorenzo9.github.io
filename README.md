# cocchialorenzo9.github.io

Personal portfolio and live project dashboards, built with [Docusaurus 2](https://docusaurus.io/).

Live at [cocchialorenzo9.github.io](https://cocchialorenzo9.github.io).

## Pages

| Route | Description |
|---|---|
| `/` | Portfolio home |
| `/projects` | Live project dashboards |
| `/home` | Our Home move-in checklist (password protected) |

Vibe Marathon moved to its own repo and site: [cocchialorenzo9/vibe-marathon](https://github.com/cocchialorenzo9/vibe-marathon), live at [cocchialorenzo9.github.io/vibe-marathon](https://cocchialorenzo9.github.io/vibe-marathon/). The old routes (`/projects/vibe-marathon`, `/projects/vibe-marathon-journal`, `/projects/vibe-marathon-race-plan`, `/marathon`) redirect there.

## Development

```bash
yarn install
yarn start        # dev server at http://localhost:3000
yarn build        # production build → ./build
```

## Deployment

Automatic. Any push to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`), which runs `yarn build` and deploys to GitHub Pages.

## Adding a new project dashboard

Bigger apps get their own repo and GitHub Pages site (like `vibe-marathon` and `vibe-plant-watering`); add a card with an absolute `href` in the `PROJECTS` array of `src/pages/projects/index.tsx`. For a small page that lives here, create `src/pages/projects/<slug>.jsx`; the route `/projects/<slug>` is live automatically.
