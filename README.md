# ICT Inventory Management

A web application for managing ICT (Information and Communications Technology) asset
inventory. Built with **Next.js 16** (App Router), **React 19** and **TypeScript**.

> ⚠️ **Nothing can be saved.** A handful of sample assets are seeded so the UI is
> reviewable, but there is no database behind the forms. See [Data](#data).

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
│   ├── types.ts                # Shared TypeScript types (all domain records)
│   ├── navigation.ts           # App configuration: nav structure, form vocabularies
│   ├── tone.ts                 # Status -> badge-colour mapping
│   ├── format.ts               # Currency / percent formatting
│   └── store\                  # Data-access layer (async, currently empty)
│       ├── assets.ts
│       ├── operations.ts
│       └── reference.ts
├── index.html                  # Legacy standalone version (reference only)
├── next.config.ts
├── tsconfig.json
└── eslint.config.mjs
```

## Data

**There is no database. The app is a read-only UI scaffold over a tiny seed dataset.**

Data access goes through async functions in `lib/store/`. Five sample assets are seeded in
`lib/store/assets.ts` (`SEED_ASSETS`) so the dashboard, register, search and filters can be
reviewed; every other store function currently returns an empty result.

| Module | Functions |
| --- | --- |
| `lib/store/assets.ts` | `listAssets`, `getAssetSummary`, `getAssetFormOptions`, `getCategoryBreakdown`, `getLocationBreakdown`, `getNextAssetCode` |
| `lib/store/operations.ts` | `listRecentActivity`, `listAssignments`, `listTransfers`, `listMaintenance`, `getMaintenanceSummary`, `listBroken`, `getAuditSummary` |
| `lib/store/reference.ts` | `listLocations`, `listDepartments`, `listSuppliers`, `listPurchases`, `listHistory`, `listUsers`, `listReports` |

**Everything on screen is derived, not hardcoded.** Dashboard counters, the category and
location breakdowns, the audit totals, the next asset code, and the Add Asset form's
category/location/department dropdowns are all computed from `listAssets()`. Add a record
to `SEED_ASSETS` and every number on the dashboard updates on its own.

**Consequences of having no storage:**

- Nothing can be saved. The Add Asset and Settings forms show a notice and discard input
  on submit. There is no database, file, or API behind them.
- Pages with no seed data (Assignments, Transfers, Maintenance, Locations, Suppliers,
  Purchasing, History, Reports) render an empty state.
- The 5 seeded assets have **no `purchasePrice` or `purchaseDate`** — those fields are
  optional and render as `—`, so **TOTAL VALUE shows `$0`**. `totalValue` sums only
  records that actually have a price.
- `Locations` and `Departments` are empty even though the seeded assets reference
  "Main Office", "Computer Lab" etc. Those reference tables were not part of the seed set.

### Known data-quality issue in the seed set

`ICT-00004` has `location: "Finance"` and `department: "Finance"` — the same value in
both columns, and "Finance" is a department name being used as a location. It was left
as-is rather than guessed at; give it a real location when the reference tables exist.

### Connecting a real data source

`lib/store/` is the only seam that needs to change. Replace the function bodies with real
queries — the pages and components consume them as-is and need no changes. For example:

```ts
// lib/store/assets.ts
import { prisma } from "@/lib/prisma";

export async function listAssets(): Promise<Asset[]> {
  const rows = await prisma.asset.findMany();
  return rows.map(toAsset);
}
```

Then wire the form buttons to Server Actions that call an `insertAsset` function you add
to the same module. The page-level `await`s and the static/dynamic rendering already work
correctly: pages stay statically prerendered until a query needs request-time data.

## Notes on the conversion

- **No hardcoded data in the UI.** Sample records live only in `lib/store/`. Dashboard
  counters, category and location breakdowns, audit totals, the next asset code, and the
  Add Asset dropdowns are all *computed* from `listAssets()` rather than hardcoded.
- **Data lives in `lib/store/`**, not in components, so a real database or API can be
  dropped in without touching the UI.
- **Search**: the top bar is a plain `GET` form to `/assets?q=…`, so it works without
  JavaScript. The All Assets page reads `q` from the URL server-side and filters live.
  Search is case-insensitive but **stored serials keep their original case**, since they
  are case-sensitive identifiers. Category and status filter options are derived from the
  records that exist, not hardcoded.
- **Client components** are only used where interactivity is needed: the sidebar (active
  link highlighting), the asset register (live filtering), the add-asset form, settings,
  the barcode tool, and the reports grid. Every other page is a server component.
- **Styling** is the original CSS, unchanged apart from: `.nav button` → `.nav a`
  (links instead of buttons), an always-on `.tablewrap` overflow, `.notice` and `.empty`
  styles, `.kpis` bottom margin, a skip link, and `:focus-visible` rings.
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
