# ICT Inventory Management

A web application for managing ICT (Information and Communications Technology) asset
inventory. Built with **Next.js 16** (App Router), **React 19** and **TypeScript**.

> ⚠️ **Nothing can be saved.** A handful of sample assets are seeded so the UI is
> reviewable, but there is no database behind the forms. See [Data](#data).
>
> 🔀 **Work in progress.** Three commits are not yet pushed to GitHub — see
> [Development log](#development-log--2-oct-2026).

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

## Development log — 2 Oct 2026

Day one of the Next.js rewrite, done with Claude. The app was a single 198-line
`index.html` (vanilla HTML/CSS/JS, no build step) and is now a Next.js App Router
project. **Nothing has been pushed yet** — see [Blocked: push](#blocked-push).

### What changed

| Commit | Change |
| --- | --- |
| `bcddede` | Converted `index.html` → Next.js 16.3.8 / React 19.3.0 / TypeScript 5.9.3 |
| `0d74a53` | Deleted all hardcoded sample data; added the empty `lib/store/` data layer |
| `7db24e1` | Cleaned the 5 asset records and seeded them into the store |

1. **Routes.** All 18 sidebar sections became real routes instead of `showPage()` div
   swapping, so deep links and the browser back button work. `app/page.tsx` redirects `/`
   to `/dashboard`, which preserves the old root-URL behaviour Vercel depends on.
2. **CSS.** The inline `<style>` block moved to `app/globals.css`. Verified faithful by
   diffing rule-by-rule against the original: 51 of 65 rules byte-identical, both media
   queries unchanged. Only deliberate deltas were `.nav button` → `.nav a` (links now),
   dropping the dead `.page` rules, plus `.notice` / `.empty` / `.spacer` / skip-link /
   `:focus-visible` additions for the new markup.
3. **Data.** `lib/data.ts` (mock records) was created, then deleted entirely at the user's
   request and replaced with `lib/store/` — async accessors that return empty results.
   Five assets were then cleaned and seeded into `lib/store/assets.ts` (`SEED_ASSETS`).
4. **Derived, not hardcoded.** Dashboard counters, category/location breakdowns, audit
   totals, the next asset code, and the Add Asset dropdown options all compute from
   `listAssets()`. Add a record and every number updates itself.

### Bugs found and fixed during verification

- **Double `aria-current="page"`.** On `/assets/new`, both "All Assets" and "Add Asset"
  were marked as the current page, because the active check used a prefix match. Now only
  the exact match sets `aria-current`; the ancestor still gets the `active` CSS class.
- **Search box missing from prerendered HTML.** The first pass made the topbar a client
  component behind a `Suspense` boundary, so the served HTML had no search input
  (layout shift, broken with JS off). Replaced with a plain `GET` form to `/assets?q=…`.
- **`setState` in an effect.** The React Compiler lint rule rejected syncing the topbar
  input to the URL via `useEffect`. Fixed with a `key`-based remount instead.
- **Dashboard flush against KPI row.** `.kpis` had no bottom margin in the original.

### Gotchas worth remembering

- **Keep ESLint on 9.x.** `eslint-config-next@16` bundles an `eslint-plugin-react` that
  crashes on ESLint 10 with `contextOrFilename.getFilename is not a function`. ESLint 10
  is the current npm release, so don't "upgrade" it without checking this.
- **`main` has no upstream tracking.** Plain `git push` fails; use `git push -u origin main`.
- **`npm view` hangs** on this machine (npm registry reachable, but the CLI times out).
  Use `Invoke-WebRequest https://registry.npmjs.org/<pkg>/latest` to check versions.
- **PowerShell**: `finally` is not a keyword (that's why one commit silently didn't run);
  `gh`/`git` write prompts to stderr, so `2>&1` output looks like errors.
- **Don't verify with mixed regex/wildcard matching.** Feeding `[regex]::Escape` output
  into PowerShell's `-like` (a wildcard operator) produces false "MISSING" results on any
  string containing a space. Use `.Contains()`.

### Blocked: push

The 3 commits are committed locally and the tree is clean, but they are **not on GitHub
yet**. `gh` was never logged in and Git Credential Manager has no stored credentials, so
`git push` fails with `could not read Username for 'https://github.com'` (no TTY available
to prompt). The repo is publicly *readable*, which is why `git ls-remote` works and can be
misleading.

To finish: authenticate with `gh auth login --web`, then `gh auth setup-git`, then
`git push -u origin main`. **Pushing will auto-deploy to production** via Vercel — note
that the live site will go from the old static mock UI to the 5-asset seeded version.

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
git push -u origin main
```

`main` has no upstream tracking configured, so the `-u` is required on the first push.
If the push is rejected with `could not read Username for 'https://github.com'`, there are
no stored credentials — authenticate first:

```
gh auth login --web      # then: gh auth setup-git
```

Vercel detects the Next.js framework, runs `npm run build`, and serves the output. There
is no longer a `index.html` entry-point requirement — the root URL `/` is handled by
`app/page.tsx`, which redirects to `/dashboard`.

> **Note:** Vercel's build needs Node 20+ (this project was developed on Node 24).
> Vercel provides this by default.

> **Security:** the GitHub and Vercel tokens used during the original setup were shared in
> chat. Rotate them and store replacements in environment variables rather than files.
