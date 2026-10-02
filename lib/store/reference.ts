import { asc, count, desc, eq, sql } from "drizzle-orm";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import {
  assets,
  departments,
  historyRecords,
  locations,
  purchaseItems,
  purchases,
  suppliers,
  users,
} from "@/lib/db/schema";
import type {
  DepartmentRecord,
  FormState,
  HistoryRecord,
  LocationRecord,
  PurchaseItemRecord,
  PurchaseRecord,
  ReportDefinition,
  SupplierRecord,
  UserRecord,
  UserRole,
  UserStatus,
} from "@/lib/types";

/* -------------------------------------------------------------- locations --- */

export async function listLocations(): Promise<LocationRecord[]> {
  const rows = await db
    .select({
      id: locations.id,
      name: locations.name,
      building: locations.building,
      room: locations.room,
      assets: count(assets.id),
    })
    .from(locations)
    .leftJoin(assets, eq(assets.locationId, locations.id))
    .groupBy(locations.id)
    .orderBy(asc(locations.name));

  return rows;
}

export interface LocationInput {
  name: string;
  building: string;
  room: string;
}

export async function insertLocation(input: LocationInput): Promise<FormState> {
  const name = input.name.trim();

  if (name === "") {
    return {
      status: "error",
      message: "Location name is required.",
      fieldErrors: { name: "Name is required." },
    };
  }

  const clash = await db
    .select({ id: locations.id })
    .from(locations)
    .where(eq(locations.name, name))
    .limit(1);

  if (clash.length > 0) {
    return {
      status: "error",
      message: `A location called ${name} already exists.`,
      fieldErrors: { name: "This name is already in use." },
    };
  }

  await db
    .insert(locations)
    .values({ name, building: input.building.trim(), room: input.room.trim() });

  return { status: "success", message: `Location ${name} added.`, fieldErrors: {} };
}

export async function updateLocation(id: number, input: LocationInput): Promise<FormState> {
  const name = input.name.trim();

  if (name === "") {
    return {
      status: "error",
      message: "Location name is required.",
      fieldErrors: { name: "Name is required." },
    };
  }

  const clash = await db
    .select({ id: locations.id })
    .from(locations)
    .where(eq(locations.name, name))
    .limit(1);

  if (clash.length > 0 && clash[0].id !== id) {
    return {
      status: "error",
      message: `A location called ${name} already exists.`,
      fieldErrors: { name: "This name is already in use." },
    };
  }

  await db
    .update(locations)
    .set({ name, building: input.building.trim(), room: input.room.trim() })
    .where(eq(locations.id, id));

  return { status: "success", message: `Location ${name} updated.`, fieldErrors: {} };
}

/** Deleting a location leaves its assets in place with no location set. */
export async function deleteLocation(id: number): Promise<FormState> {
  const [row] = await db
    .select({ name: locations.name })
    .from(locations)
    .where(eq(locations.id, id))
    .limit(1);

  if (!row) {
    return { status: "error", message: "That location no longer exists.", fieldErrors: {} };
  }

  await db.delete(locations).where(eq(locations.id, id));

  return { status: "success", message: `Location ${row.name} deleted.`, fieldErrors: {} };
}

/* ------------------------------------------------------------ departments --- */

export async function listDepartments(): Promise<DepartmentRecord[]> {
  const [assetCounts, userCounts] = await Promise.all([
    db
      .select({ departmentId: assets.departmentId, total: count() })
      .from(assets)
      .groupBy(assets.departmentId),
    db
      .select({ departmentId: users.departmentId, total: count() })
      .from(users)
      .groupBy(users.departmentId),
  ]);

  const rows = await db
    .select({
      id: departments.id,
      name: departments.name,
      manager: departments.manager,
    })
    .from(departments)
    .orderBy(asc(departments.name));

  const assetsBy = new Map(assetCounts.map((row) => [row.departmentId ?? 0, row.total]));
  const usersBy = new Map(userCounts.map((row) => [row.departmentId ?? 0, row.total]));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    manager: row.manager,
    assets: assetsBy.get(row.id) ?? 0,
    users: usersBy.get(row.id) ?? 0,
  }));
}

export interface DepartmentInput {
  name: string;
  manager: string;
}

export async function insertDepartment(input: DepartmentInput): Promise<FormState> {
  const name = input.name.trim();

  if (name === "") {
    return {
      status: "error",
      message: "Department name is required.",
      fieldErrors: { name: "Name is required." },
    };
  }

  const clash = await db
    .select({ id: departments.id })
    .from(departments)
    .where(eq(departments.name, name))
    .limit(1);

  if (clash.length > 0) {
    return {
      status: "error",
      message: `A department called ${name} already exists.`,
      fieldErrors: { name: "This name is already in use." },
    };
  }

  await db
    .insert(departments)
    .values({ name, manager: input.manager.trim() });

  return { status: "success", message: `Department ${name} added.`, fieldErrors: {} };
}

export async function updateDepartment(
  id: number,
  input: DepartmentInput,
): Promise<FormState> {
  const name = input.name.trim();

  if (name === "") {
    return {
      status: "error",
      message: "Department name is required.",
      fieldErrors: { name: "Name is required." },
    };
  }

  const clash = await db
    .select({ id: departments.id })
    .from(departments)
    .where(eq(departments.name, name))
    .limit(1);

  if (clash.length > 0 && clash[0].id !== id) {
    return {
      status: "error",
      message: `A department called ${name} already exists.`,
      fieldErrors: { name: "This name is already in use." },
    };
  }

  await db
    .update(departments)
    .set({ name, manager: input.manager.trim() })
    .where(eq(departments.id, id));

  return { status: "success", message: `Department ${name} updated.`, fieldErrors: {} };
}

export async function deleteDepartment(id: number): Promise<FormState> {
  const [row] = await db
    .select({ name: departments.name })
    .from(departments)
    .where(eq(departments.id, id))
    .limit(1);

  if (!row) {
    return { status: "error", message: "That department no longer exists.", fieldErrors: {} };
  }

  await db.delete(departments).where(eq(departments.id, id));

  return { status: "success", message: `Department ${row.name} deleted.`, fieldErrors: {} };
}

/* -------------------------------------------------------------- suppliers --- */

export async function listSuppliers(): Promise<SupplierRecord[]> {
  const rows = await db
    .select({
      id: suppliers.id,
      name: suppliers.name,
      contact: suppliers.contact,
      phone: suppliers.phone,
      email: suppliers.email,
      assets: count(assets.id),
    })
    .from(suppliers)
    .leftJoin(assets, eq(assets.supplierId, suppliers.id))
    .groupBy(suppliers.id)
    .orderBy(asc(suppliers.name));

  return rows;
}

export interface SupplierInput {
  name: string;
  contact: string;
  phone: string;
  email: string;
}

export async function insertSupplier(input: SupplierInput): Promise<FormState> {
  const name = input.name.trim();

  if (name === "") {
    return {
      status: "error",
      message: "Supplier name is required.",
      fieldErrors: { name: "Name is required." },
    };
  }

  const clash = await db
    .select({ id: suppliers.id })
    .from(suppliers)
    .where(eq(suppliers.name, name))
    .limit(1);

  if (clash.length > 0) {
    return {
      status: "error",
      message: `A supplier called ${name} already exists.`,
      fieldErrors: { name: "This name is already in use." },
    };
  }

  await db.insert(suppliers).values({
    name,
    contact: input.contact.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
  });

  return { status: "success", message: `Supplier ${name} added.`, fieldErrors: {} };
}

export async function updateSupplier(id: number, input: SupplierInput): Promise<FormState> {
  const name = input.name.trim();

  if (name === "") {
    return {
      status: "error",
      message: "Supplier name is required.",
      fieldErrors: { name: "Name is required." },
    };
  }

  const clash = await db
    .select({ id: suppliers.id })
    .from(suppliers)
    .where(eq(suppliers.name, name))
    .limit(1);

  if (clash.length > 0 && clash[0].id !== id) {
    return {
      status: "error",
      message: `A supplier called ${name} already exists.`,
      fieldErrors: { name: "This name is already in use." },
    };
  }

  await db
    .update(suppliers)
    .set({
      name,
      contact: input.contact.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
    })
    .where(eq(suppliers.id, id));

  return { status: "success", message: `Supplier ${name} updated.`, fieldErrors: {} };
}

export async function deleteSupplier(id: number): Promise<FormState> {
  const [row] = await db
    .select({ name: suppliers.name })
    .from(suppliers)
    .where(eq(suppliers.id, id))
    .limit(1);

  if (!row) {
    return { status: "error", message: "That supplier no longer exists.", fieldErrors: {} };
  }

  await db.delete(suppliers).where(eq(suppliers.id, id));

  return { status: "success", message: `Supplier ${row.name} deleted.`, fieldErrors: {} };
}

/* -------------------------------------------------------------- purchases --- */

export async function listPurchases(): Promise<PurchaseRecord[]> {
  const rows = await db
    .select({
      id: purchases.id,
      invoice: purchases.invoice,
      purchaseDate: purchases.purchaseDate,
      supplierId: purchases.supplierId,
      supplier: suppliers.name,
      total: purchases.total,
      notes: purchases.notes,
    })
    .from(purchases)
    .leftJoin(suppliers, eq(purchases.supplierId, suppliers.id))
    .orderBy(desc(purchases.purchaseDate));

  const itemCounts = await db
    .select({ purchaseId: purchaseItems.purchaseId, total: count() })
    .from(purchaseItems)
    .groupBy(purchaseItems.purchaseId);

  const itemsBy = new Map(itemCounts.map((row) => [row.purchaseId, row.total]));

  return rows.map((row) => ({
    id: row.id,
    invoice: row.invoice,
    date: row.purchaseDate,
    supplierId: row.supplierId,
    supplier: row.supplier ?? "",
    items: itemsBy.get(row.id) ?? 0,
    total: Number(row.total),
    notes: row.notes,
  }));
}

export async function getPurchaseById(id: number): Promise<PurchaseRecord | null> {
  const [row] = await db
    .select({
      id: purchases.id,
      invoice: purchases.invoice,
      purchaseDate: purchases.purchaseDate,
      supplierId: purchases.supplierId,
      supplier: suppliers.name,
      total: purchases.total,
      notes: purchases.notes,
    })
    .from(purchases)
    .leftJoin(suppliers, eq(purchases.supplierId, suppliers.id))
    .where(eq(purchases.id, id))
    .limit(1);

  if (!row) {
    return null;
  }

  const [countRow] = await db
    .select({ total: count() })
    .from(purchaseItems)
    .where(eq(purchaseItems.purchaseId, id));

  return {
    id: row.id,
    invoice: row.invoice,
    date: row.purchaseDate,
    supplierId: row.supplierId,
    supplier: row.supplier ?? "",
    items: countRow?.total ?? 0,
    total: Number(row.total),
    notes: row.notes,
  };
}

export async function getPurchaseItems(purchaseId: number): Promise<PurchaseItemRecord[]> {
  const rows = await db
    .select()
    .from(purchaseItems)
    .where(eq(purchaseItems.purchaseId, purchaseId))
    .orderBy(asc(purchaseItems.id));

  return rows.map((row) => ({
    id: row.id,
    description: row.description,
    quantity: row.quantity,
    unitPrice: Number(row.unitPrice),
    lineTotal: Number(row.unitPrice) * row.quantity,
  }));
}

export interface PurchaseInput {
  invoice: string;
  purchaseDate: string;
  supplierId: number | null;
  total: number;
  notes: string;
  items: { description: string; quantity: number; unitPrice: number }[];
}

export async function insertPurchase(input: PurchaseInput): Promise<FormState> {
  const invoice = input.invoice.trim();

  if (invoice === "") {
    return {
      status: "error",
      message: "Invoice number is required.",
      fieldErrors: { invoice: "Invoice number is required." },
    };
  }

  if (Number.isNaN(Date.parse(input.purchaseDate))) {
    return {
      status: "error",
      message: "Enter a valid purchase date.",
      fieldErrors: { purchaseDate: "A valid date is required." },
    };
  }

  const clash = await db
    .select({ id: purchases.id })
    .from(purchases)
    .where(eq(purchases.invoice, invoice))
    .limit(1);

  if (clash.length > 0) {
    return {
      status: "error",
      message: `Invoice ${invoice} already exists.`,
      fieldErrors: { invoice: "This invoice number is already in use." },
    };
  }

  const items = input.items.filter((item) => item.description.trim() !== "");

  // With line items the total is derived from them; without, the typed figure stands.
  const derived = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const [created] = await db
    .insert(purchases)
    .values({
      invoice,
      purchaseDate: input.purchaseDate,
      supplierId: input.supplierId,
      total: (items.length === 0 ? input.total : derived).toFixed(2),
      notes: input.notes.trim(),
    })
    .returning({ id: purchases.id });

  if (items.length > 0) {
    await db.insert(purchaseItems).values(
      items.map((item) => ({
        purchaseId: created.id,
        description: item.description.trim(),
        quantity: Math.max(1, Math.trunc(item.quantity)),
        unitPrice: item.unitPrice.toFixed(2),
      })),
    );
  }

  return { status: "success", message: `Purchase ${invoice} recorded.`, fieldErrors: {} };
}

export async function deletePurchase(id: number): Promise<FormState> {
  const [row] = await db
    .select({ invoice: purchases.invoice })
    .from(purchases)
    .where(eq(purchases.id, id))
    .limit(1);

  if (!row) {
    return { status: "error", message: "That purchase no longer exists.", fieldErrors: {} };
  }

  await db.delete(purchases).where(eq(purchases.id, id));

  return { status: "success", message: `Purchase ${row.invoice} deleted.`, fieldErrors: {} };
}

/* ---------------------------------------------------------------- history --- */

export async function listHistory(): Promise<HistoryRecord[]> {
  const rows = await db.select().from(historyRecords).orderBy(desc(historyRecords.year));

  return rows.map((row) => ({
    id: row.id,
    year: row.year,
    item: row.item,
    category: row.category,
    supplier: row.supplier,
    value: Number(row.value),
    remarks: row.remarks,
  }));
}

export interface HistoryInput {
  year: number;
  item: string;
  category: string;
  supplier: string;
  value: number | null;
  remarks: string;
}

export async function insertHistory(input: HistoryInput): Promise<FormState> {
  if (input.item.trim() === "") {
    return {
      status: "error",
      message: "Item description is required.",
      fieldErrors: { item: "Item is required." },
    };
  }

  if (!Number.isInteger(input.year) || input.year < 1900 || input.year > 2200) {
    return {
      status: "error",
      message: "Enter a valid year.",
      fieldErrors: { year: "Enter a year between 1900 and 2200." },
    };
  }

  await db.insert(historyRecords).values({
    year: input.year,
    item: input.item.trim(),
    category: input.category.trim(),
    supplier: input.supplier.trim(),
    value: input.value === null ? "0.00" : input.value.toFixed(2),
    remarks: input.remarks.trim(),
  });

  return { status: "success", message: `Historical record for ${input.year} added.`, fieldErrors: {} };
}

export async function deleteHistory(id: number): Promise<FormState> {
  const [row] = await db
    .select({ item: historyRecords.item })
    .from(historyRecords)
    .where(eq(historyRecords.id, id))
    .limit(1);

  if (!row) {
    return { status: "error", message: "That record no longer exists.", fieldErrors: {} };
  }

  await db.delete(historyRecords).where(eq(historyRecords.id, id));

  return { status: "success", message: `Historical record "${row.item}" deleted.`, fieldErrors: {} };
}

/* ------------------------------------------------------------------ users --- */

export async function listUsers(): Promise<UserRecord[]> {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      departmentId: users.departmentId,
      status: users.status,
      createdAt: users.createdAt,
      department: departments.name,
    })
    .from(users)
    .leftJoin(departments, eq(users.departmentId, departments.id))
    .orderBy(asc(users.name));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    department: row.department ?? "",
    departmentId: row.departmentId,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  }));
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  departmentId: number | null;
  status: UserStatus;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateUser(input: UserInput, requirePassword: boolean): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (input.name.trim() === "") {
    fieldErrors.name = "Name is required.";
  }

  if (!EMAIL_PATTERN.test(input.email.trim())) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (requirePassword && input.password.length < 8) {
    fieldErrors.password = "Password must be at least 8 characters.";
  }

  return fieldErrors;
}

export async function insertUser(input: UserInput): Promise<FormState> {
  const fieldErrors = validateUser(input, true);

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors };
  }

  const email = input.email.trim().toLowerCase();
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`lower(${users.email}) = ${email}`)
    .limit(1);

  if (existing.length > 0) {
    return {
      status: "error",
      message: `${email} already has an account.`,
      fieldErrors: { email: "This email is already registered." },
    };
  }

  await db.insert(users).values({
    name: input.name.trim(),
    email,
    passwordHash: await hashPassword(input.password),
    role: input.role,
    departmentId: input.departmentId,
    status: input.status,
  });

  return { status: "success", message: `User ${input.name.trim()} added.`, fieldErrors: {} };
}

export async function updateUser(
  id: number,
  input: UserInput,
  currentUserId: number,
): Promise<FormState> {
  // An empty password means "leave the existing one alone".
  const fieldErrors = validateUser(input, input.password !== "" && input.password.length < 8);

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors };
  }

  const email = input.email.trim().toLowerCase();
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`lower(${users.email}) = ${email}`)
    .limit(1);

  if (existing.length > 0 && existing[0].id !== id) {
    return {
      status: "error",
      message: `${email} already has an account.`,
      fieldErrors: { email: "This email is already registered." },
    };
  }

  if (id === currentUserId && input.status === "Inactive") {
    return {
      status: "error",
      message: "You cannot deactivate your own account.",
      fieldErrors: { status: "You cannot deactivate your own account." },
    };
  }

  const values: Partial<typeof users.$inferInsert> = {
    name: input.name.trim(),
    email,
    role: input.role,
    departmentId: input.departmentId,
    status: input.status,
  };

  if (input.password !== "") {
    values.passwordHash = await hashPassword(input.password);
  }

  await db.update(users).set(values).where(eq(users.id, id));

  return { status: "success", message: `User ${input.name.trim()} updated.`, fieldErrors: {} };
}

export async function deleteUser(id: number, currentUserId: number): Promise<FormState> {
  if (id === currentUserId) {
    return {
      status: "error",
      message: "You cannot delete your own account.",
      fieldErrors: {},
    };
  }

  const [row] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!row) {
    return { status: "error", message: "That user no longer exists.", fieldErrors: {} };
  }

  await db.delete(users).where(eq(users.id, id));

  return { status: "success", message: `User ${row.name} deleted.`, fieldErrors: {} };
}

export async function checkPassword(
  email: string,
  password: string,
): Promise<{ id: number; status: UserStatus } | null> {
  const [row] = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${email.trim().toLowerCase()}`)
    .limit(1);

  if (!row) {
    return null;
  }

  const valid = await verifyPassword(password, row.passwordHash);

  return valid ? { id: row.id, status: row.status } : null;
}

/* ----------------------------------------------------------------- single --- */

export async function getLocationById(
  id: number,
): Promise<{ id: number; name: string; building: string; room: string } | null> {
  const [row] = await db
    .select({
      id: locations.id,
      name: locations.name,
      building: locations.building,
      room: locations.room,
    })
    .from(locations)
    .where(eq(locations.id, id))
    .limit(1);

  return row ?? null;
}

export async function getDepartmentById(
  id: number,
): Promise<{ id: number; name: string; manager: string } | null> {
  const [row] = await db
    .select({
      id: departments.id,
      name: departments.name,
      manager: departments.manager,
    })
    .from(departments)
    .where(eq(departments.id, id))
    .limit(1);

  return row ?? null;
}

export async function getSupplierById(
  id: number,
): Promise<{ id: number; name: string; contact: string; phone: string; email: string } | null> {
  const [row] = await db
    .select({
      id: suppliers.id,
      name: suppliers.name,
      contact: suppliers.contact,
      phone: suppliers.phone,
      email: suppliers.email,
    })
    .from(suppliers)
    .where(eq(suppliers.id, id))
    .limit(1);

  return row ?? null;
}

export async function getUserById(id: number): Promise<UserRecord | null> {
  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      departmentId: users.departmentId,
      status: users.status,
      createdAt: users.createdAt,
      department: departments.name,
    })
    .from(users)
    .leftJoin(departments, eq(users.departmentId, departments.id))
    .where(eq(users.id, id))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    department: row.department ?? "",
    departmentId: row.departmentId,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

/* --------------------------------------------------------------- reports --- */

export const REPORT_DEFINITIONS: ReportDefinition[] = [
  {
    slug: "register",
    icon: "📦",
    title: "Asset Register",
    description: "Complete list of ICT assets and current status.",
  },
  {
    slug: "valuation",
    icon: "💰",
    title: "Asset Valuation",
    description: "Purchase value and inventory valuation by category.",
  },
  {
    slug: "maintenance",
    icon: "🔧",
    title: "Maintenance",
    description: "Maintenance history, status and repair costs.",
  },
  {
    slug: "broken",
    icon: "⚠️",
    title: "Broken Assets",
    description: "Damaged, broken and repair records.",
  },
  {
    slug: "location",
    icon: "🏢",
    title: "Location Report",
    description: "Assets grouped by location, with values.",
  },
  {
    slug: "department",
    icon: "🏫",
    title: "Department Report",
    description: "Assets assigned to each department, with values.",
  },
];

export async function listReports(): Promise<ReportDefinition[]> {
  return REPORT_DEFINITIONS;
}
