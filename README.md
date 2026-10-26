# Roadmap Hub

A small, static React app for exploring learning roadmaps and tracking personal progress. The first roadmap is **.NET to AI Architect**.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`; Vite writes the static site to `dist/`.

## Progress and backups

Roadmap progress and custom sections are stored in versioned browser `localStorage`. They stay in the current browser profile and do not sync across devices. Use **Export backup** on a roadmap to download a JSON backup, and **Import backup** to restore it.

## Add a roadmap

Add an entry to `src/data/roadmaps.ts` using the `Roadmap` type, then add its slug to the catalog. Built-in content is the starting point; user changes are stored locally.

## Cloudflare Pages

Connect the GitHub repository in Cloudflare Pages and set:

- Build command: `npm run build`
- Build output directory: `dist`

The app uses client-side routes. Cloudflare Pages serves the SPA fallback automatically when no top-level `404.html` is present.
