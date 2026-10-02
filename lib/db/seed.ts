/**
 * Seeds the local PostgreSQL database with a realistic ICT inventory.
 *
 *   npm run db:seed          # seed only if the database is empty
 *   npm run db:reset         # wipe every table, then seed
 *
 * The generator is seeded with a fixed value, so the same command always
 * produces the same database. That keeps screenshots, bug reports and the
 * numbers quoted in the README reproducible.
 */
import { sql } from "drizzle-orm";

import { hashPassword } from "@/lib/auth/password";
import { db, pool } from "@/lib/db";
import type { AssetCondition, Availability } from "@/lib/types";
import {
  assets,
  assignments,
  audits,
  brokenItems,
  departments,
  historyRecords,
  locations,
  maintenance,
  purchaseItems,
  purchases,
  settings,
  suppliers,
  transfers,
  users,
} from "@/lib/db/schema";

/** ---------------------------------------------------------------- random --- */

/** Deterministic PRNG (mulberry32) so every run yields identical data. */
function makeRandom(seed: number) {
  let state = seed;

  return function next(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = makeRandom(20261002);

const pick = <T>(values: readonly T[]): T =>
  values[Math.floor(random() * values.length)];

const between = (min: number, max: number): number =>
  min + Math.floor(random() * (max - min + 1));

/** Weighted pick: [["Desktop", 152], ...] */
function weighted<T extends string>(entries: readonly (readonly [T, number])[]): T {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = random() * total;

  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll <= 0) {
      return value;
    }
  }

  return entries[entries.length - 1][0];
}

const money = (value: number): string => value.toFixed(2);

/** Builds a YYYY-MM-DD string `daysAgo` days before the fixed reference date. */
const REFERENCE_DATE = new Date("2026-10-02T00:00:00Z");

function daysAgo(days: number): string {
  const date = new Date(REFERENCE_DATE);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

const betweenDates = (minDaysAgo: number, maxDaysAgo: number): string =>
  daysAgo(between(minDaysAgo, maxDaysAgo));

/** ------------------------------------------------------------- reference --- */

const LOCATION_DATA = [
  { name: "Main Office", building: "Administration Building", room: "Ground Floor" },
  { name: "Computer Lab", building: "Academic Building", room: "Lab 01" },
  { name: "Library", building: "Academic Building", room: "Library" },
  { name: "Room 101", building: "Academic Building", room: "Room 101" },
  { name: "Server Room", building: "Administration Building", room: "Basement" },
  { name: "Finance Office", building: "Administration Building", room: "First Floor" },
  { name: "HR Office", building: "Administration Building", room: "First Floor" },
  { name: "Meeting Room", building: "Academic Building", room: "Room 205" },
] as const;

const DEPARTMENT_DATA = [
  { name: "ICT", manager: "Sokha Chea" },
  { name: "Administration", manager: "Dara Lim" },
  { name: "Academic", manager: "Sreyneang Pich" },
  { name: "Finance", manager: "Bopha Keo" },
  { name: "Human Resources", manager: "Chan Sokha" },
  { name: "Library", manager: "Mony Khmer" },
] as const;

const SUPPLIER_DATA = [
  {
    name: "ABC Technology",
    contact: "Sales Team",
    phone: "012 000 111",
    email: "sales@abctech.example",
  },
  {
    name: "Local ICT Supplier",
    contact: "Support Desk",
    phone: "010 111 222",
    email: "support@localict.example",
  },
  {
    name: "Delta Computer",
    contact: "Vichana Sreymom",
    phone: "093 222 333",
    email: "orders@deltacomputer.example",
  },
  {
    name: "Mekong Office Systems",
    contact: "Purchasing Office",
    phone: "088 333 444",
    email: "purchasing@mekongoffice.example",
  },
  {
    name: "Phnom Penh Tech",
    contact: "Corporate Sales",
    phone: "070 444 555",
    email: "corp@pptech.example",
  },
] as const;

/** Default passwords for the seeded accounts. Documented in the README. */
const ADMIN_PASSWORD = "Admin@123";
const STAFF_PASSWORD = "Staff@123";

const USER_DATA = [
  {
    name: "ICT Administrator",
    email: "admin@example.com",
    password: ADMIN_PASSWORD,
    role: "Administrator" as const,
    department: "ICT",
  },
  {
    name: "Sokha Chea",
    email: "sokha.chea@example.com",
    password: STAFF_PASSWORD,
    role: "ICT Staff" as const,
    department: "ICT",
  },
  {
    name: "Dara Lim",
    email: "dara.lim@example.com",
    password: STAFF_PASSWORD,
    role: "ICT Staff" as const,
    department: "Administration",
  },
  {
    name: "Sreyneang Pich",
    email: "sreyneang.pich@example.com",
    password: STAFF_PASSWORD,
    role: "Viewer" as const,
    department: "Academic",
  },
  {
    name: "Bopha Keo",
    email: "bopha.keo@example.com",
    password: STAFF_PASSWORD,
    role: "Viewer" as const,
    department: "Finance",
  },
  {
    name: "Chan Sokha",
    email: "chan.sokha@example.com",
    password: STAFF_PASSWORD,
    role: "Viewer" as const,
    department: "Human Resources",
  },
  {
    name: "Mony Khmer",
    email: "mony.khmer@example.com",
    password: STAFF_PASSWORD,
    role: "Viewer" as const,
    department: "Library",
  },
  {
    name: "Sokha Vann",
    email: "sokha.vann@example.com",
    password: STAFF_PASSWORD,
    role: "ICT Staff" as const,
    department: "ICT",
  },
];

/** ----------------------------------------------------------------- assets --- */

const CATEGORY_DISTRIBUTION = [
  ["Desktop", 152],
  ["Laptop", 121],
  ["Monitor", 94],
  ["Printer", 65],
  ["Network", 48],
  ["Projector", 34],
  ["Scanner", 26],
  ["UPS", 25],
  ["Server", 18],
] as const;

const CATALOG: Record<string, { brands: string[]; models: string[]; min: number; max: number }> = {
  Desktop: {
    brands: ["Dell", "HP", "Lenovo", "Acer", "Asus"],
    models: ["OptiPlex 7060", "ProDesk 400", "ThinkCentre M720", "Veriton X2680G", "ExpertCenter D500"],
    min: 420,
    max: 1150,
  },
  Laptop: {
    brands: ["HP", "Dell", "Lenovo", "Apple"],
    models: ["ProBook 450", "Latitude 5490", "ThinkPad E490", "MacBook Air 2017"],
    min: 520,
    max: 1650,
  },
  Monitor: {
    brands: ["Dell", "HP", "LG", "Acer"],
    models: ["P2419H", "E233", "22MK400H", "K2416H"],
    min: 95,
    max: 260,
  },
  Printer: {
    brands: ["HP", "Canon", "Epson", "Brother"],
    models: ["LaserJet Pro M404", "LBP2900+", "LBP2900", "MFC-L2710DW"],
    min: 160,
    max: 780,
  },
  Network: {
    brands: ["Cisco", "TP-Link", "Ubiquiti", "MikroTik"],
    models: ["Catalyst 2960", "TL-SG1024D", "UniFi AC Pro", "RB750Gr3"],
    min: 75,
    max: 640,
  },
  Projector: {
    brands: ["Epson", "BenQ", "Canon", "ViewSonic"],
    models: ["EB-X06", "MW5500", "LV-RN500", "PA500U"],
    min: 280,
    max: 1450,
  },
  Scanner: {
    brands: ["Canon", "Epson", "HP"],
    models: ["DR-C240", "DS-530", "ScanJet Pro 2500"],
    min: 120,
    max: 520,
  },
  UPS: {
    brands: ["APC", "Eaton", "CyberPower"],
    models: ["Back-UPS 1500", "5P 1550i", "CP1500AVRLCD"],
    min: 90,
    max: 480,
  },
  Server: {
    brands: ["Dell", "HPE", "Lenovo"],
    models: ["PowerEdge R740", "ProLiant DL380", "ThinkSystem SR650"],
    min: 2200,
    max: 7800,
  },
};

const ASSET_COUNT = CATEGORY_DISTRIBUTION.reduce((sum, [, n]) => sum + n, 0);

const CONDITION_WEIGHTS: readonly (readonly [AssetCondition, number])[] = [
  ["Good", 78],
  ["Fair", 17],
  ["Poor", 5],
];

/** Used when an asset is not already "Assigned" by virtue of its status. */
const AVAILABILITY_WEIGHTS: readonly (readonly [Availability, number])[] = [
  ["Available", 70],
  ["Spare", 30],
];

/**
 * The dashboard headlines in the original design mock: 583 total, 48 broken,
 * 15 in maintenance. Those counts are reproduced here so the figures match.
 */
const BROKEN_COUNT = 48;
const MAINTENANCE_COUNT = 15;
const ACTIVE_COUNT = 300;

const REMARK_POOL = [
  "",
  "",
  "",
  "Includes warranty until 2028.",
  "Shared with teaching staff.",
  "Kept in storage room when not in use.",
  "Recently replaced battery.",
  "Scheduled for replacement next fiscal year.",
  "Donated by partner organisation.",
  "Assigned to a shared workstation pool.",
];

const PROBLEMS = [
  "Paper feed failure",
  "Will not power on",
  "No display output",
  "Battery no longer holds charge",
  "Overheating under load",
  "Lamp burned out",
  "Cracked screen bezel",
  "Keyboard keys unresponsive",
  "Fan noise and thermal shutdowns",
  "Network port not detecting link",
  "Scanner lid sensor faulty",
  "Print quality degraded",
];

const TECHNICIANS = [
  "ICT Service",
  "ICT Staff",
  "External - ABC Technology",
  "External - Delta Computer",
  "On-site Engineer",
];

/** ------------------------------------------------------------------- main --- */

async function isEmpty(): Promise<boolean> {
  const result = await db.execute<{ count: string }>(
    sql`select count(*)::text as count from assets`,
  );
  return Number(result.rows[0]?.count ?? "0") === 0;
}

async function truncateAll(): Promise<void> {
  // Order does not matter with CASCADE, but listing it explicitly documents intent.
  await db.execute(sql`
    truncate table
      purchase_items, purchases, history_records, audits, broken_items,
      maintenance, transfers, assignments, sessions, assets, users,
      suppliers, departments, locations, settings
    restart identity cascade
  `);
}

async function main() {
  const shouldReset = process.argv.includes("--reset");

  if (shouldReset) {
    process.stdout.write("Resetting all tables...\n");
    await truncateAll();
  } else if (!(await isEmpty())) {
    process.stdout.write(
      "Database already contains assets. Re-run with --reset (npm run db:reset) to wipe and reseed.\n",
    );
    return;
  }

  // 1. Reference data ---------------------------------------------------------
  const locationRows = await db
    .insert(locations)
    .values(LOCATION_DATA.map((row) => ({ ...row })))
    .returning();

  const departmentRows = await db
    .insert(departments)
    .values(DEPARTMENT_DATA.map((row) => ({ ...row })))
    .returning();

  const supplierRows = await db
    .insert(suppliers)
    .values(SUPPLIER_DATA.map((row) => ({ ...row })))
    .returning();

  const departmentIdByName = new Map(departmentRows.map((row) => [row.name, row.id]));

  // 2. Users ------------------------------------------------------------------
  const hashedAdmin = await hashPassword(ADMIN_PASSWORD);
  const hashedStaff = await hashPassword(STAFF_PASSWORD);

  const userRows = await db
    .insert(users)
    .values(
      USER_DATA.map((row) => ({
        name: row.name,
        email: row.email,
        passwordHash: row.password === ADMIN_PASSWORD ? hashedAdmin : hashedStaff,
        role: row.role,
        departmentId: departmentIdByName.get(row.department) ?? null,
        status: "Active" as const,
      })),
    )
    .returning({ id: users.id, name: users.name, role: users.role });

  // 3. Assets -----------------------------------------------------------------
  const statusPlan: ("Active" | "Assigned" | "Maintenance" | "Broken")[] = [
    ...Array.from({ length: BROKEN_COUNT }, () => "Broken" as const),
    ...Array.from({ length: MAINTENANCE_COUNT }, () => "Maintenance" as const),
    ...Array.from({ length: ACTIVE_COUNT }, () => "Active" as const),
  ];

  const remaining = ASSET_COUNT - statusPlan.length;

  for (let i = 0; i < remaining; i += 1) {
    statusPlan.push(random() < 0.42 ? "Active" : "Assigned");
  }

  const assetValues = [];
  let codeNumber = 0;

  for (const [category, quantity] of CATEGORY_DISTRIBUTION) {
    const catalog = CATALOG[category];

    for (let i = 0; i < quantity; i += 1) {
      codeNumber += 1;

      const status = statusPlan[codeNumber - 1];
      const purchaseDaysAgo = between(120, 2400);
      // A couple of assets deliberately have no price so the "—" rendering and
      // the partial-sum behaviour of TOTAL VALUE stay exercised.
      const omitPrice = random() < 0.02;

      assetValues.push({
        code: `ICT-${String(codeNumber).padStart(5, "0")}`,
        category,
        brand: pick(catalog.brands),
        model: pick(catalog.models),
        serial: `${pick(["CPJZWX", "5CD123", "X1234", "VNC98", "CN-123", "SN", "KJ", "MB"])}${between(
          1000,
          999999,
        )}`,
        locationId: pick(locationRows).id,
        departmentId: pick(departmentRows).id,
        supplierId: pick(supplierRows).id,
        status,
        condition: weighted(CONDITION_WEIGHTS),
        availability:
          status === "Assigned" ? "Assigned" : weighted(AVAILABILITY_WEIGHTS),
        purchasePrice: omitPrice ? null : money(between(catalog.min, catalog.max)),
        purchaseDate: daysAgo(purchaseDaysAgo),
        remarks: pick(REMARK_POOL),
      });
    }
  }

  const assetRows = await db
    .insert(assets)
    .values(assetValues)
    .returning({
      id: assets.id,
      code: assets.code,
      status: assets.status,
      locationId: assets.locationId,
    });

  // 4. Assignments ------------------------------------------------------------
  const assignedAssets = assetRows.filter((row) => row.status === "Assigned");
  const assignableUsers = userRows.filter((row) => row.role !== "Viewer");

  const assignmentValues = [
    ...assignedAssets.map((asset) => ({
      assetId: asset.id,
      userId: pick(assignableUsers).id,
      departmentId: pick(departmentRows).id,
      locationId: asset.locationId,
      assignedDate: betweenDates(5, 700),
      status: "Assigned" as const,
      notes: "",
    })),
    // A slice of historical, already-returned assignments.
    ...Array.from({ length: 40 }, () => {
      const asset = pick(assetRows);
      const assignedDate = betweenDates(200, 1200);

      return {
        assetId: asset.id,
        userId: pick(assignableUsers).id,
        departmentId: pick(departmentRows).id,
        locationId: pick(locationRows).id,
        assignedDate,
        returnedDate: daysAgo(between(1, 200)),
        status: "Returned" as const,
        notes: pick(REMARK_POOL),
      };
    }),
  ];

  await db.insert(assignments).values(assignmentValues);

  // 5. Transfers --------------------------------------------------------------
  await db.insert(transfers).values(
    Array.from({ length: 70 }, () => {
      const asset = pick(assetRows);
      const from = pick(locationRows);
      let to = pick(locationRows);

      while (to.id === from.id) {
        to = pick(locationRows);
      }

      return {
        assetId: asset.id,
        fromLocationId: from.id,
        toLocationId: to.id,
        transferDate: betweenDates(1, 500),
        transferredBy: pick(assignableUsers).id,
        status: (random() < 0.9 ? "Completed" : "Pending") as "Completed" | "Pending",
        notes: pick(REMARK_POOL),
      };
    }),
  );

  // 6. Maintenance (15 open, 6 in progress, the rest completed) ----------------
  const maintenanceStatusPlan = [
    ...Array.from({ length: MAINTENANCE_COUNT }, () => "Open" as const),
    ...Array.from({ length: 6 }, () => "In Progress" as const),
    ...Array.from({ length: 96 }, () => "Completed" as const),
  ];

  await db.insert(maintenance).values(
    maintenanceStatusPlan.map((status) => {
      const requestDaysAgo = between(1, 600);

      return {
        assetId: pick(assetRows).id,
        problem: pick(PROBLEMS),
        requestDate: daysAgo(requestDaysAgo),
        technician: status === "Open" ? "" : pick(TECHNICIANS),
        cost:
          status === "Completed"
            ? money(between(15, 480))
            : status === "In Progress"
              ? money(between(0, 120))
              : money(0),
        status,
        completedDate: status === "Completed" ? daysAgo(Math.max(requestDaysAgo - 14, 0)) : null,
        notes: pick(REMARK_POOL),
      };
    }),
  );

  // 7. Broken items -----------------------------------------------------------
  const brokenAssets = assetRows.filter((row) => row.status === "Broken");

  await db.insert(brokenItems).values(
    brokenAssets.map((asset, index) => {
      const repairing = index % 3 === 0;
      const reportedDaysAgo = between(1, 260);

      return {
        assetId: asset.id,
        problem: pick(PROBLEMS),
        locationId: asset.locationId,
        reportedDate: daysAgo(reportedDaysAgo),
        action: repairing ? "Repair" : pick(["Repair", "Replace", "Awaiting parts", "Vendor RMA"]),
        status: (repairing ? "Repairing" : "Broken") as "Repairing" | "Broken",
        resolvedDate: null,
        notes: pick(REMARK_POOL),
      };
    }),
  );

  // 8. Audits (521 verified, 7 missing, 55 pending) ---------------------------
  // `audits.asset_id` is unique, so walk the assets in order rather than picking
  // at random, which would eventually collide.
  const auditPlan: ("Verified" | "Missing" | "Pending")[] = assetRows.map((_, index) => {
    if (index < 7) {
      return "Missing";
    }

    return index < 62 ? "Pending" : "Verified";
  });

  await db.insert(audits).values(
    assetRows.map((asset, index) => {
      const result = auditPlan[index];

      return {
        assetId: asset.id,
        auditDate: betweenDates(10, 400),
        auditor: pick(assignableUsers).name,
        result,
        notes: result === "Missing" ? "Not found during physical verification." : "",
      };
    }),
  );

  // 9. Purchases --------------------------------------------------------------
  const purchaseValues = Array.from({ length: 26 }, (_, index) => {
    const supplier = pick(supplierRows);
    const itemCount = between(2, 9);
    const unitPrices = Array.from({ length: itemCount }, () => between(80, 1400));
    const total = unitPrices.reduce((sum, price) => sum + price, 0);

    return {
      id: index,
      invoice: `INV-${2026 - (index % 3)}-${String(index + 1).padStart(3, "0")}`,
      purchaseDate: betweenDates(5, 900),
      supplierId: supplier.id,
      total: money(total),
      notes: "",
      items: unitPrices.map((price) => ({
        description: `${pick(Object.keys(CATALOG))} - ${pick(["Standard", "Plus", "Pro", "Basic"])}`,
        quantity: between(1, 12),
        unitPrice: money(price),
      })),
    };
  });

  for (const purchase of purchaseValues) {
    const { items, ...header } = purchase;
    const inserted = await db
      .insert(purchases)
      .values({
        invoice: header.invoice,
        purchaseDate: header.purchaseDate,
        supplierId: header.supplierId,
        total: header.total,
        notes: header.notes,
      })
      .returning({ id: purchases.id });

    await db.insert(purchaseItems).values(
      items.map((item) => ({ ...item, purchaseId: inserted[0].id })),
    );
  }

  // 10. Historical records (2013-2018) ---------------------------------------
  const historicalItems = [
    "Desktop Computer",
    "Laptop",
    "Laser Printer",
    "Projector",
    "Network Switch",
    "Photocopier",
    "Scanner",
    "Server",
    "Monitor",
    "Interactive Whiteboard",
  ];

  const historicalRemarks = [
    "Historical record",
    "Imported from paper ledger",
    "Transferred to ICT unit",
    "Partially written off",
    "Donated",
    "Replaced by newer model",
  ];

  await db.insert(historyRecords).values(
    Array.from({ length: 48 }, () => ({
      year: between(2013, 2018),
      item: pick(historicalItems),
      category: pick(["Computer", "Peripheral", "Network", "Audio Visual"]),
      supplier: pick(["Historical Supplier", "Ministry of Education", "NGO Donation", "Local Dealer"]),
      value: money(between(120, 2400)),
      remarks: pick(historicalRemarks),
    })),
  );

  // 11. Settings --------------------------------------------------------------
  await db.insert(settings).values({
    id: 1,
    organizationName: "ICT Inventory Management",
    assetCodePrefix: "ICT-",
    currency: "USD",
    dateFormat: "dd-mmm-yyyy",
  });

  const counts = await db.execute<{ label: string; count: string }>(sql`
    select 'assets' as label, count(*)::text as count from assets
    union all select 'assignments', count(*)::text from assignments
    union all select 'transfers', count(*)::text from transfers
    union all select 'maintenance', count(*)::text from maintenance
    union all select 'broken_items', count(*)::text from broken_items
    union all select 'audits', count(*)::text from audits
    union all select 'purchases', count(*)::text from purchases
    union all select 'purchase_items', count(*)::text from purchase_items
    union all select 'history_records', count(*)::text from history_records
    union all select 'locations', count(*)::text from locations
    union all select 'departments', count(*)::text from departments
    union all select 'suppliers', count(*)::text from suppliers
    union all select 'users', count(*)::text from users
    order by label
  `);

  process.stdout.write("\nSeed complete:\n");

  for (const row of counts.rows) {
    process.stdout.write(`  ${row.label.padEnd(18)} ${row.count}\n`);
  }

  process.stdout.write(
    `\nSign in with:\n` +
      `  Administrator  admin@example.com  ${ADMIN_PASSWORD}\n` +
      `  ICT Staff      sokha.chea@example.com  ${STAFF_PASSWORD}\n` +
      `  Viewer         sreyneang.pich@example.com  ${STAFF_PASSWORD}\n`,
  );
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    // Drizzle embeds the full SQL and every bound parameter in its message, which
    // for a 583-row insert runs to tens of thousands of characters. Keep it short.
    const message = error instanceof Error ? error.message : String(error);
    const brief = message.split("\n")[0].slice(0, 400);

    process.stderr.write(`\nSeed failed: ${brief}\n`);
    if (error instanceof Error && error.stack) {
      const frame = error.stack.split("\n").find((line) => line.includes("lib/db/seed.ts"));
      if (frame) {
        process.stderr.write(`  at ${frame.trim()}\n`);
      }
    }
    await pool.end();
    process.exit(1);
  });
