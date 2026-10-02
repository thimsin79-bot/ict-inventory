import { relations, sql } from "drizzle-orm";
import {
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const assetStatus = pgEnum("asset_status", [
  "Active",
  "Assigned",
  "Maintenance",
  "Broken",
]);

export const assetCondition = pgEnum("asset_condition", ["Good", "Fair", "Poor"]);

export const availability = pgEnum("availability", ["Available", "Assigned", "Spare"]);

export const maintenanceStatus = pgEnum("maintenance_status", [
  "Open",
  "In Progress",
  "Completed",
]);

export const brokenStatus = pgEnum("broken_status", ["Broken", "Repairing", "Resolved"]);

export const userStatus = pgEnum("user_status", ["Active", "Inactive"]);

export const userRole = pgEnum("user_role", ["Administrator", "ICT Staff", "Viewer"]);

export const assignmentStatus = pgEnum("assignment_status", ["Assigned", "Returned"]);

export const transferStatus = pgEnum("transfer_status", ["Pending", "Completed"]);

export const auditResult = pgEnum("audit_result", ["Verified", "Missing", "Pending"]);

/** Single-row table holding the editable system configuration (row id is always 1). */
export const settings = pgTable("settings", {
  id: integer("id").primaryKey(),
  organizationName: text("organization_name").notNull().default(""),
  assetCodePrefix: text("asset_code_prefix").notNull().default("ICT-"),
  currency: text("currency").notNull().default("USD"),
  dateFormat: text("date_format").notNull().default("dd-mmm-yyyy"),
});

export const locations = pgTable(
  "locations",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    building: text("building").notNull().default(""),
    room: text("room").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("locations_name_key").on(table.name)],
);

export const departments = pgTable(
  "departments",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    manager: text("manager").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("departments_name_key").on(table.name)],
);

export const suppliers = pgTable(
  "suppliers",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    contact: text("contact").notNull().default(""),
    phone: text("phone").notNull().default(""),
    email: text("email").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("suppliers_name_key").on(table.name)],
);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRole("role").notNull().default("Viewer"),
    departmentId: integer("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    status: userStatus("status").notNull().default("Active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("users_email_key").on(sql`lower(${table.email})`),
    index("users_department_idx").on(table.departmentId),
  ],
);

/** One row per signed-in browser session. Only the hash of the token is stored. */
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("sessions_user_idx").on(table.userId)],
);

export const assets = pgTable(
  "assets",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull(),
    category: text("category").notNull(),
    brand: text("brand").notNull().default(""),
    model: text("model").notNull().default(""),
    serial: text("serial").notNull().default(""),
    locationId: integer("location_id").references(() => locations.id, { onDelete: "set null" }),
    departmentId: integer("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    supplierId: integer("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
    status: assetStatus("status").notNull().default("Active"),
    condition: assetCondition("condition").notNull().default("Good"),
    availability: availability("availability").notNull().default("Available"),
    purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 }),
    purchaseDate: date("purchase_date"),
    remarks: text("remarks").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("assets_code_key").on(table.code),
    index("assets_category_idx").on(table.category),
    index("assets_status_idx").on(table.status),
    index("assets_location_idx").on(table.locationId),
    index("assets_department_idx").on(table.departmentId),
  ],
);

export const assignments = pgTable(
  "assignments",
  {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    departmentId: integer("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    locationId: integer("location_id").references(() => locations.id, { onDelete: "set null" }),
    assignedDate: date("assigned_date").notNull(),
    returnedDate: date("returned_date"),
    status: assignmentStatus("status").notNull().default("Assigned"),
    notes: text("notes").notNull().default(""),
  },
  (table) => [
    index("assignments_asset_idx").on(table.assetId),
    index("assignments_status_idx").on(table.status),
  ],
);

export const transfers = pgTable(
  "transfers",
  {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    fromLocationId: integer("from_location_id").references(() => locations.id, {
      onDelete: "set null",
    }),
    toLocationId: integer("to_location_id").references(() => locations.id, {
      onDelete: "set null",
    }),
    transferDate: date("transfer_date").notNull(),
    transferredBy: integer("transferred_by").references(() => users.id, {
      onDelete: "set null",
    }),
    status: transferStatus("status").notNull().default("Completed"),
    notes: text("notes").notNull().default(""),
  },
  (table) => [index("transfers_asset_idx").on(table.assetId)],
);

export const maintenance = pgTable(
  "maintenance",
  {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    problem: text("problem").notNull(),
    requestDate: date("request_date").notNull(),
    technician: text("technician").notNull().default(""),
    cost: numeric("cost", { precision: 12, scale: 2 }).notNull().default("0"),
    status: maintenanceStatus("status").notNull().default("Open"),
    completedDate: date("completed_date"),
    notes: text("notes").notNull().default(""),
  },
  (table) => [
    index("maintenance_asset_idx").on(table.assetId),
    index("maintenance_status_idx").on(table.status),
  ],
);

export const brokenItems = pgTable(
  "broken_items",
  {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    problem: text("problem").notNull(),
    locationId: integer("location_id").references(() => locations.id, { onDelete: "set null" }),
    reportedDate: date("reported_date").notNull(),
    action: text("action").notNull().default(""),
    status: brokenStatus("status").notNull().default("Broken"),
    resolvedDate: date("resolved_date"),
    notes: text("notes").notNull().default(""),
  },
  (table) => [index("broken_items_asset_idx").on(table.assetId)],
);

export const audits = pgTable(
  "audits",
  {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    auditDate: date("audit_date").notNull(),
    auditor: text("auditor").notNull().default(""),
    result: auditResult("result").notNull().default("Pending"),
    notes: text("notes").notNull().default(""),
  },
  (table) => [
    uniqueIndex("audits_asset_key").on(table.assetId),
    index("audits_result_idx").on(table.result),
  ],
);

export const purchases = pgTable(
  "purchases",
  {
    id: serial("id").primaryKey(),
    invoice: text("invoice").notNull(),
    purchaseDate: date("purchase_date").notNull(),
    supplierId: integer("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
    total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
    notes: text("notes").notNull().default(""),
  },
  (table) => [uniqueIndex("purchases_invoice_key").on(table.invoice)],
);

export const purchaseItems = pgTable(
  "purchase_items",
  {
    id: serial("id").primaryKey(),
    purchaseId: integer("purchase_id")
      .notNull()
      .references(() => purchases.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull().default("0"),
  },
  (table) => [index("purchase_items_purchase_idx").on(table.purchaseId)],
);

/** Imported pre-migration inventory records (2013-2018); not linked to live assets. */
export const historyRecords = pgTable(
  "history_records",
  {
    id: serial("id").primaryKey(),
    year: integer("year").notNull(),
    item: text("item").notNull(),
    category: text("category").notNull().default(""),
    supplier: text("supplier").notNull().default(""),
    value: numeric("value", { precision: 12, scale: 2 }).notNull().default("0"),
    remarks: text("remarks").notNull().default(""),
  },
  (table) => [index("history_records_year_idx").on(table.year)],
);

export const locationsRelations = relations(locations, ({ many }) => ({
  assets: many(assets),
  assignments: many(assignments),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  assets: many(assets),
  users: many(users),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  assets: many(assets),
  purchases: many(purchases),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
  sessions: many(sessions),
  assignments: many(assignments),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  location: one(locations, { fields: [assets.locationId], references: [locations.id] }),
  department: one(departments, {
    fields: [assets.departmentId],
    references: [departments.id],
  }),
  supplier: one(suppliers, { fields: [assets.supplierId], references: [suppliers.id] }),
  assignments: many(assignments),
  transfers: many(transfers),
  maintenance: many(maintenance),
  brokenItems: many(brokenItems),
  audit: one(audits),
}));

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  asset: one(assets, { fields: [assignments.assetId], references: [assets.id] }),
  user: one(users, { fields: [assignments.userId], references: [users.id] }),
  department: one(departments, {
    fields: [assignments.departmentId],
    references: [departments.id],
  }),
  location: one(locations, { fields: [assignments.locationId], references: [locations.id] }),
}));

export const transfersRelations = relations(transfers, ({ one }) => ({
  asset: one(assets, { fields: [transfers.assetId], references: [assets.id] }),
  fromLocation: one(locations, {
    fields: [transfers.fromLocationId],
    references: [locations.id],
  }),
  toLocation: one(locations, { fields: [transfers.toLocationId], references: [locations.id] }),
  user: one(users, { fields: [transfers.transferredBy], references: [users.id] }),
}));

export const maintenanceRelations = relations(maintenance, ({ one }) => ({
  asset: one(assets, { fields: [maintenance.assetId], references: [assets.id] }),
}));

export const brokenItemsRelations = relations(brokenItems, ({ one }) => ({
  asset: one(assets, { fields: [brokenItems.assetId], references: [assets.id] }),
  location: one(locations, { fields: [brokenItems.locationId], references: [locations.id] }),
}));

export const auditsRelations = relations(audits, ({ one }) => ({
  asset: one(assets, { fields: [audits.assetId], references: [assets.id] }),
}));

export const purchasesRelations = relations(purchases, ({ one, many }) => ({
  supplier: one(suppliers, { fields: [purchases.supplierId], references: [suppliers.id] }),
  items: many(purchaseItems),
}));

export const purchaseItemsRelations = relations(purchaseItems, ({ one }) => ({
  purchase: one(purchases, {
    fields: [purchaseItems.purchaseId],
    references: [purchases.id],
  }),
}));

export type AssetRow = typeof assets.$inferSelect;
export type NewAssetRow = typeof assets.$inferInsert;
export type UserRow = typeof users.$inferSelect;
export type LocationRow = typeof locations.$inferSelect;
export type DepartmentRow = typeof departments.$inferSelect;
export type SupplierRow = typeof suppliers.$inferSelect;
export type SettingsRow = typeof settings.$inferSelect;
