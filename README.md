# ICT Inventory Management

A front-end web application for managing ICT (Information and Communications Technology) asset inventory. It is a single-page interface built with HTML, CSS, and vanilla JavaScript — no external dependencies or build tools required.

## Features

- **Dashboard** — overview of total assets, active/broken/maintenance counts, total value, assets by category and location, and recent activity
- **Assets** — searchable register of all ICT assets (code, category, brand/model, serial number, location, department, status)
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

## Getting Started

1. Open `index.html` in any modern web browser.
2. Alternatively, serve the folder locally and open it in the browser.

No server, database, or installation is required. Data shown is sample/static mock data for a demonstration UI.

## Project Structure

```
D:\ICT INVENTORY\
├── index.html           # Complete application (HTML, CSS, JS)
├── .gitignore
└── README.md
```

## Navigating the UI

- Use the sidebar to switch between pages.
- The global search bar (top bar) filters assets — press Enter to jump to the All Assets page with the search applied.
- The Asset search on the All Assets page filters rows live as you type.

## Demo Notes

- Buttons such as **Save Asset**, **Generate Code**, and **Save Settings** show `alert()` placeholders as this is a demonstration interface.
- Sample data (583 assets across 2018 and earlier categories) is illustrative only.

## Deployment & Git Workflow (set up 1 Oct 2026)

This project is already connected to **GitHub** and **Vercel** with **automatic deploys on every push to `main`**. You do not need to redeploy manually — just edit, commit, and push.

### Where it lives

- **GitHub repo:** `thimsin79-bot/ict-inventory` → https://github.com/thimsin79-bot/ict-inventory
- **Live site (Vercel):** https://ict-inventory-iota.vercel.app
- **Vercel project:** `ict-inventory` (team: `thimsin`, account: `thimsin79-8849`)
- **Production branch:** `main` — pushes to it auto-build and go live.

### How to publish a change

From the `D:\ICT INVENTORY` folder:

```
git add -A
git commit -m "describe your change"
git push origin main
```

The Vercel Git integration picks up the new commit and redeploys automatically (takes a few seconds). Verify it by reloading the live URL.

### The 404 fix that was made today

The site initially returned **404** because the page was named `ICT_Inventory.html`. Vercel only serves a file at the root URL (`/`) if it is named `index.html`. Fix: the file was renamed to `index.html` (README references updated to match). **If you ever add a new page, remember to keep the entry-point file named `index.html`.**

### Local ↔ live

- Run locally by just opening `index.html` in a browser (no build step, no dependencies).
- To deploy a one-off preview without touching Git: `vercel --token <your-token>` from this folder.

### Tooling notes (learned today)

- Auth for `gh` and `vercel` is done via personal access tokens passed with `--token` / `gh auth setup-git` (no interactive browser login was available on this machine).
- Pushing tokens through a PowerShell pipe into `gh` can mangle them; writing the token to a temp file and using `cmd /c "... < file"` reliably authenticated.
- Commits may warn `LF will be replaced by CRLF` on Windows — this is normal and harmless.

> **Security:** the GitHub and Vercel tokens used for this setup were shared in chat. Consider rotating them and storing replacements securely (e.g., environment variables) rather than in files.