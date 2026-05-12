# Income & Principal Tracker

A static, local-first single-page web app for projecting income and principal across multiple sources (W2, 1099, dividends, hard money loans, brokerage withdrawals). All state lives in your browser; nothing is sent to any server.

## Features

- Five income source types with full per-source tax handling
- Real-time dashboard: summary cards, stacked area, principal trajectory, source-mix pie, range bars
- Margin call simulator and dividend reinvestment (DRIP)
- Sequence-of-returns stress test for brokerage withdrawals
- Sensitivity sliders that recompute live without modifying saved data
- Scenarios: save, rename, duplicate, delete, and compare up to 3 side-by-side
- Goal mode: target a monthly net and see when you hit it
- JSON export/import with Zod validation and schema versioning
- Light/dark mode, keyboard shortcuts, print stylesheet
- Mobile-first responsive UI with bottom tab bar, full-screen sheets, and PWA installability
- Works offline; runs from `file://` or GitHub Pages

## Stack

Vite + React + TypeScript, Tailwind CSS, Radix UI primitives, Recharts, Zustand (persist middleware), Zod.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

The build output goes to `dist/`. Because Vite is configured with `base: "./"`, the bundle works whether served from a subpath (GitHub Pages), the site root, or directly via `file://`.

## Deploy

Push to `main` and the workflow in `.github/workflows/deploy.yml` builds and publishes to GitHub Pages. Enable Pages → Source: GitHub Actions in your repo settings.

## Testing

```bash
npm test
```

Unit tests cover each calculation module plus an integration test that snapshots a realistic multi-source scenario.

## Disclaimer

Estimates only. Not financial, investment, or tax advice. Verify with a licensed professional.
