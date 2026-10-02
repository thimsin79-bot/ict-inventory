# ICT Inventory Management

A web application for managing ICT (Information and Communications Technology) asset
inventory. Built with **Next.js 16** (App Router), **React 19**, **TypeScript**,
**Drizzle ORM** and **PostgreSQL**.

> **Fully database-backed.** Every list, form, filter and report reads and writes a real
> PostgreSQL database. Server Actions re-check permissions, sessions are stored as
> hashed tokens in the database, and a deterministic seed supplies a realistic
> 582-asset dataset for development.

## Features

- **Dashboard** — total/active/broken/maintenance counts, total value, assets by category
  and location, and recent activity
- **Assets** — searchable, filterable, sortable, paginated register with CSV export,
  asset detail pages, timeline, and full create/edit/delete
- **Equipment** — live counts by equipment category
- **Assignments** — assign assets to staff and departments, with return tracking
- **Transfers** — record asset movements between locations
- **Maintenance** — maintenance requests, service history, technician and cost tracking
- **Broken / Damaged** — damaged and non-working asset records
- **Asset Audit** — verify physical assets against the register
- **Barcode / QR** — generate real QR codes and print asset labels
- **Locations / Departments / Suppliers** — full reference-data CRUD
- **Purchasing** — purchase records with line items, invoices and totals
- **History** — imported historical inventory records
- **Reports** — asset register, valuation, maintenance, broken assets, location and
  department reports, each with a printable view and CSV download
- **Users & Roles** — accounts, roles and access control
- **Settings** — organization name, asset code prefix, currency and date format
- **Live updates** — open pages refresh automatically when assets or operations
  (assignments, transfers, maintenance, broken, audit) change, pushed over SSE

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.3.8 (App Router, Turbopack) |
| UI | React 19.3.0, plain CSS design system (no Tailwind/UI library) |
| Language | TypeScript 5.9.3 |
| Database | PostgreSQL 18 |
| ORM | Drizzle ORM 0.45.3 + `pg` 8.23.1 |
| Auth | scrypt password hashes, hashed DB-backed sessions, `httpOnly` cookie |
| QR | `qrcode` 1.5.4 |
| Lint | ESLint 9.39.5 (`eslint-config-next` 16.3.8) |

## Getting started

```bash
npm install

# 1. Create the database and a .env file
copy .env.example .env          # then fill in DATABASE_URL and SESSION_SECRET

# 2. Apply the schema and seed demo data
npm run db:push                 # create/update tables from lib/db/schema.ts
npm run db:reset                # wipe + reseed the deterministic dataset

# 3. Run
npm run dev                     # http://localhost:3000
```

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:push` | Push the Drizzle schema to the database |
| `npm run db:generate` | Generate SQL migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Seed without wiping |
| `npm run db:reset` | Wipe and reseed |
| `npm run db:studio` | Open Drizzle Studio |

### Demo accounts

| Email | Password | Role |
| --- | --- | --- |
| `admin@example.com` | `Admin@123` | Administrator |
| `sokha.chea@example.com` | `Staff@123` | ICT Staff |
| `sreyneang.pich@example.com` | `Staff@123` | ICT Staff |

The seed also creates additional ICT Staff and Viewer accounts.

## Roles & permissions

| Role | Can do |
| --- | --- |
| **Administrator** | Everything, including Users, Settings and destructive actions |
| **ICT Staff** | Create and edit assets, assignments, transfers, maintenance, broken, audit and reference data; cannot manage users/settings |
| **Viewer** | Read-only access to all registers and reports |

Permissions are enforced twice: the UI hides controls the role cannot use, and every
Server Action independently calls `assertCanWrite()` / `assertAdministrator()` before
touching the database. Authentication is checked in `app/(app)/layout.tsx` via
`lib/auth/guards.ts` (layout-based rather than middleware, because Edge middleware cannot
use `pg`).

## Routes

| Route | Page | Route | Page |
| --- | --- | --- | --- |
| `/` | redirects to `/dashboard` | `/barcode` | Barcode / QR |
| `/login` | Sign in | `/locations` | Locations |
| `/dashboard` | Dashboard | `/departments` | Departments |
| `/assets` | All Assets | `/suppliers` | Suppliers |
| `/assets/new` | Add Asset | `/purchases` | Purchasing |
| `/assets/[id]` | Asset detail | `/purchases/[id]` | Purchase detail |
| `/assets/[id]/edit` | Edit Asset | `/history` | Historical Inventory |
| `/equipment` | Equipment | `/reports` | Reports & Analytics |
| `/assignments` | Assignments | `/reports/[slug]` | Printable report |
| `/transfers` | Transfers | `/users` | Users & Roles |
| `/maintenance` | Maintenance | `/settings` | Settings |
| `/broken` | Broken / Damaged | `/forbidden` | Access denied |
| `/audit` | Asset Audit | | |

API routes: `/api/assets/export` (CSV), `/api/reports/[slug]` (CSV), `/api/qr` (PNG).

## Project structure

```
.
├── app\
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Design system + print styles
│   ├── page.tsx                # Redirects / -> /dashboard
│   ├── login\                  # Login page + server action
│   ├── api\                    # QR + CSV export route handlers
│   └── (app)\                  # Route group: shared app shell (auth-guarded)
│       ├── layout.tsx          # Sidebar + topbar + <main>
│       └── <page>\page.tsx     # One folder per route
├── components\                 # UI + client components (RecordForm, AssetForm, ...)
├── lib\
│   ├── auth\                   # password, session, guards, server actions
│   ├── db\                     # schema.ts, index.ts (pool), seed.ts
│   ├── store\                  # Data-access layer (async)
│   │   ├── assets.ts           # Asset register + aggregates
│   │   ├── operations.ts       # assignments, transfers, maintenance, broken, audit
│   │   ├── reference.ts        # locations, departments, suppliers, purchases, history, users
│   │   ├── reference-actions.ts# "use server" CRUD actions
│   │   ├── actions.ts          # "use server" operations actions
│   │   ├── reports.ts          # Report builders
│   │   ├── timeline.ts         # Per-asset timeline
│   │   ├── options.ts          # Picker options
│   │   └── settings.ts         # Settings read/write
│   ├── format.ts / format-server.ts  # Currency/date formatting (settings-aware)
│   ├── csv.ts                  # RFC 4180 CSV writer (UTF-8 BOM)
│   ├── permissions.ts          # Role capabilities
│   └── types.ts                # Shared domain types
├── next.config.ts
├── drizzle.config.ts
├── tsconfig.json
└── eslint.config.mjs
```

## Data layer

`lib/store/` is the only seam between the UI and the database. Pages are server
components that `await` these functions directly; `lib/store/index.ts` re-exports every
module. Server Actions live beside them, validate input, enforce permissions and call
`revalidatePath`.

Schema (15 tables) is defined in `lib/db/schema.ts` and applied with
`npm run db:push`. The seed in `lib/db/seed.ts` is deterministic and recreates the same
dataset on every `db:reset`.

## Realtime updates

Live updates use **Server-Sent Events** and require no extra infrastructure:

- `lib/realtime/types.ts` — client-safe types and the backend contract
  (`publish()` / `subscribe()`), including the topic and action unions.
- `lib/realtime/local.ts` — the in-process backend: a single `EventEmitter` stored on
  `globalThis` so every Server Action and route handler shares one instance.
- `lib/realtime/redis.ts` — the Redis backend. When `REDIS_URL` is set, one client
  publishes to a channel (`ict:realtime:change`) and a second subscribes and forwards
  messages back into the local emitter, so a change published on any instance reaches the
  SSE clients of every instance.
- `lib/realtime/bus.ts` — selects the backend once per process (`redis` when `REDIS_URL`
  is present, otherwise `local`) and exposes `publish()` / `subscribe()` so callers never
  depend on the transport.
- `app/api/events/route.ts` — authenticated SSE stream; clients subscribe to the topics
  they care about via `?topics=assets,assignments`. Sends a `ready` event and periodic
  heartbeat comments.
- `components/LiveRefresh.tsx` — a client component that opens an `EventSource` and calls
  `router.refresh()` (debounced) when a watched topic fires, re-fetching the page's server
  components without a full reload. Refreshes are deferred while the tab is hidden.
- Server Actions call `publish()` only after a mutation succeeds.

Scope: the dashboard, asset register, asset detail, and the five operations pages
(assignments, transfers, maintenance, broken, audit). Create/edit form pages are
intentionally excluded so a background change cannot overwrite in-progress input.

### Scaling with Redis (optional)

Live updates work out of the box on a single long-running Node server (`next dev` /
`next start`). To run multiple instances and have every instance see every change, point
`REDIS_URL` at a Redis server and `bus.ts` switches to the Redis backend automatically:

```
REDIS_URL=redis://localhost:6379
```

If Redis is configured but temporarily unreachable, publishing falls back to the local
emitter so a single instance keeps working, and connections use bounded backoff and
reconnect. Other brokers (e.g. Postgres `LISTEN/NOTIFY`) can be added the same way by
implementing the `RealtimeBackend` contract and returning it from `selectBackend()`.

## Deployment

The application requires a persistent PostgreSQL database, which the original Vercel
static deployment did not provide. `https://ict-inventory-iota.vercel.app` therefore still
serves the legacy static build and is **out of scope** for this version. Deploying this
build requires a managed Postgres instance (or equivalent) plus a `DATABASE_URL` and
`SESSION_SECRET` in the hosting environment.

## Git workflow

```
git add -A
git commit -m "describe your change"
git push -u origin main
```

`main` has no upstream tracking configured upstream, so `-u` is required on the first
push. If a push is rejected with `could not read Username for 'https://github.com'` there
are no stored credentials — authenticate first with
`gh auth login --web` and then `gh auth setup-git`.

## Notes

- **Keep ESLint on 9.x.** `eslint-config-next@16` bundles an `eslint-plugin-react` that
  crashes on ESLint 10 with `contextOrFilename.getFilename is not a function`.
- **`npm view` hangs** on this machine; query the registry with
  `Invoke-WebRequest https://registry.npmjs.org/<pkg>/latest` instead.
- **Search** is a plain `GET` form to `/assets?q=…`, so it works without JavaScript; the
  register reads filters from the URL server-side and paginates in the database.
- **CSV exports** include a UTF-8 BOM so Excel opens non-ASCII names correctly.
- **QR labels** are generated by `/api/qr` and print without the app chrome via a
  `@media print` stylesheet.
- `index.html` at the repo root is the legacy standalone version, kept for reference only.
