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
└── README.md
```

## Navigating the UI

- Use the sidebar to switch between pages.
- The global search bar (top bar) filters assets — press Enter to jump to the All Assets page with the search applied.
- The Asset search on the All Assets page filters rows live as you type.

## Demo Notes

- Buttons such as **Save Asset**, **Generate Code**, and **Save Settings** show `alert()` placeholders as this is a demonstration interface.
- Sample data (583 assets across 2018 and earlier categories) is illustrative only.