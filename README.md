# Julia Moyo — Portfolio

Personal portfolio of Julia Moyo, full stack software developer in Johannesburg.

Built with React, TypeScript and Vite. No UI libraries, just hand-written CSS.

## Features

The whole site is a terminal, styled after the VS Code integrated terminal (grey, dark pink and green).

- Commands: `about`, `projects` (filter with `projects ai`), `open <name>`, `skills`, `journey`, `certs`, `repos`, `pipeline`, `contact`, `cv`, `ls`, `cat <file>`, `history`, `clear`, and `sudo hire julia`.
- Command history (↑ / ↓), Tab completion, Ctrl+L to clear.
- Every command is also clickable, so visitors never have to type.
- `repos` pulls live data from the GitHub API, with built-in fallback content.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build     # type-checks, then outputs to dist/
npm run preview   # serve the production build
```

## Editing content

Everything on the page (projects, skills, timeline, certifications, links) lives in [`src/data.ts`](src/data.ts).

## Deploy

Every push to `main` builds the site and publishes it to GitHub Pages through
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

One-time setup: in the repository go to Settings → Pages and set **Source** to **GitHub Actions**.
