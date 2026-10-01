# ICT Inventory Management

A web application for managing ICT (Information and Communications Technology) asset
inventory. Built with **Next.js 16** (App Router), **React 19** and **TypeScript**.

> Converted from the original single-file static app. `index.html` at the repo root is the
> legacy standalone version, kept only for reference — the live application is the
> Next.js app described below.

## Features

- **Dashboard** — overview of total assets, active/broken/maintenance counts, total value, assets by category and location, and recent activity
- **Assets** — searchable, filterable register of all ICT assets (code, category, brand/model, serial number, location, department, status)
- **Add Asset** — form for registering new assets
- **Equipment** — summary counts by equipment category
- **Assignments** — track assets assigned to staff and departments
- **Transfers** — record asset movements between locations and users
- **Maintenance** — maintenance requests, service history, and costs
- **Broken / Damaged** — damaged and non-working asset records
- **Asset Audit** — verify physical assets against the register
- **Barcode / QR** — generate and print asset identification labels
- **Locations / Departments / Suppliers** — reference data management
- **Purchasing** — purchase records, invoices, and procurement history
- **History** — imported historical records (2013–2018) and asset history
- **Reports** — asset register, valuation, maintenance, broken assets, location, and department reports
- **Users & Roles** — system user management
- **Settings** — organization, asset code prefix, currency, and date format configuration

## Getting started

```bash
npm install     # install dependencies
npm run dev     # start the dev server on http://localhost:3000
npm run build   # production build
npm start       # serve the production build
npm run lint    # eslint
npm run typecheck   # tsc --noEmit
```

## Routes

Each sidebar section is a real URL (not in-page state switching), so the browser
back/forward buttons and deep links work.

| Route | Page | Route | Page |
| --- | --- | --- | --- |
| `/` | redirects to `/dashboard` | `/barcode` | Barcode / QR |
| `/dashboard` | Dashboard | `/locations` | Locations |
| `/assets` | All Assets | `/departments` | Departments |
| `/assets/new` | Add Asset | `/suppliers` | Suppliers |
| `/equipment` | Equipment | `/purchases` | Purchasing |
| `/assignments` | Assignments | `/history` | Historical Inventory |
| `/transfers` | Transfers | `/reports` | Reports & Analytics |
| `/maintenance` | Maintenance | `/users` | Users & Roles |
| `/broken` | Broken / Damaged | `/settings` | Settings |
| `/audit` | Asset Audit | | |

## Project structure

```
D:\ICT INVENTORY\
├── app\
│   ├── layout.tsx              # Root layout: <html>, metadata, global CSS
│   ├── globals.css             # All styling (carried over from the original <style>)
│   ├── page.tsx                # Redirects / -> /dashboard
│   └── (app)\                  # Route group: shared app shell
│       ├── layout.tsx          # Sidebar + topbar + <main>
│       └── <page>\page.tsx     # One folder per route
├── components\                 # React components (UI + client-side interactivity)
├── lib\
│   ├── types.ts                # Shared TypeScript types
│   └── data.ts                 # All mock/sample data + nav definition
├── index.html                  # Legacy standalone version (reference only)
├── next.config.ts
├── tsconfig.json
└── eslint.config.mjs
```

## Notes on the conversion

- **Data** lives in `lib/data.ts` as typed constants, so it can be swapped for a real
  database or API later without touching the UI components.
- **Search**: the top bar is a plain `GET` form to `/assets?q=…`, so it works without
  JavaScript. The All Assets page reads `q` from the URL server-side and filters live.
- **Client components** are only used where interactivity is needed: the sidebar (active
  link highlighting), the asset register (live filtering), the add-asset form, settings,
  the barcode tool, and the reports grid. Every other page is a static server component
  and is prerendered at build time.
- **Styling** is the original CSS, unchanged apart from: `.nav button` → `.nav a`
  (links instead of buttons), an always-on `.tablewrap` overflow, a `.notice` style for
  inline status messages, `.kpis` bottom margin, a skip link, and `:focus-visible` rings.
- **Demo placeholders** (Save Asset, Export Excel, Generate Code, Save Settings, report
  generation, print label) show an inline status message instead of `alert()`. No data is
  persisted — everything is static mock data.
- Styling is plain CSS with a small custom design system. No Tailwind, no UI library.

## Deployment & Git workflow

This project is connected to **GitHub** and **Vercel** with **automatic deploys on every
push to `main`**.

### Where it lives

- **GitHub repo:** `thimsin79-bot/ict-inventory` → https://github.com/thimsin79-bot/ict-inventory
- **Live site (Vercel):** https://ict-inventory-iota.vercel.app
- **Vercel project:** `ict-inventory` (team: `thimsin`, account: `thimsin79-8849`)
- **Production branch:** `main` — pushes auto-build and go live.

### How to publish a change

```
git add -A
git commit -m "describe your change"
git push origin main
```

Vercel detects the Next.js framework, runs `npm run build`, and serves the output. There
is no longer a `index.html` entry-point requirement — the root URL `/` is handled by
`app/page.tsx`, which redirects to `/dashboard`.

> **Note:** Vercel's build needs Node 20+ (this project was developed on Node 24).
> Vercel provides this by default.
