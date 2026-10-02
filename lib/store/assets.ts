import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  or,
  sql,
  type AnyColumn,
  type SQL,
} from "drizzle-orm";

import { db } from "@/lib/db";
import { assets, departments, locations, suppliers } from "@/lib/db/schema";
import type {
  Asset,
  AssetFilters,
  AssetFormOptions,
  AssetSortKey,
  AssetSummary,
  Breakdown,
  CategoryStat,
  FormState,
  Paginated,
} from "@/lib/types";
import { getSettings } from "@/lib/store/settings";

/** Joins that resolve the display names an asset row needs. */
const ASSET_SELECT = {
  id: assets.id,
  code: assets.code,
  category: assets.category,
  brand: assets.brand,
  model: assets.model,
  serial: assets.serial,
  status: assets.status,
  condition: assets.condition,
  availability: assets.availability,
  purchasePrice: assets.purchasePrice,
  purchaseDate: assets.purchaseDate,
  remarks: assets.remarks,
  createdAt: assets.createdAt,
  locationId: assets.locationId,
  departmentId: assets.departmentId,
  supplierId: assets.supplierId,
  locationName: locations.name,
  departmentName: departments.name,
  supplierName: suppliers.name,
};

type AssetJoined = {
  id: number;
  code: string;
  category: string;
  brand: string;
  model: string;
  serial: string;
  status: Asset["status"];
  condition: Asset["condition"];
  availability: Asset["availability"];
  purchasePrice: string | null;
  purchaseDate: string | null;
  remarks: string;
  createdAt: Date;
  locationId: number | null;
  departmentId: number | null;
  supplierId: number | null;
  locationName: string | null;
  departmentName: string | null;
  supplierName: string | null;
};

function toAsset(row: AssetJoined): Asset {  return {
    id: row.id,
    code: row.code,
    category: row.category,
    brand: row.brand,
    model: row.model,
    serial: row.serial,
    location: row.locationName ?? "",
    department: row.departmentName ?? "",
    status: row.status,
    purchasePrice: row.purchasePrice === null ? undefined : Number(row.purchasePrice),
    purchaseDate: row.purchaseDate ?? undefined,
    locationId: row.locationId,
    departmentId: row.departmentId,
    supplierId: row.supplierId,
    supplier: row.supplierName ?? "",
    condition: row.condition,
    availability: row.availability,
    remarks: row.remarks,
    createdAt: row.createdAt.toISOString(),
  };
}

const SORT_COLUMNS: Record<AssetSortKey, AnyColumn> = {
  code: assets.code,
  category: assets.category,
  brand: assets.brand,
  status: assets.status,
  location: locations.name,
  department: departments.name,
  purchaseDate: assets.purchaseDate,
  purchasePrice: assets.purchasePrice,
};

function buildWhere(filters: AssetFilters): SQL | undefined {
  const clauses: (SQL | undefined)[] = [];

  const q = filters.q?.trim();

  if (q) {
    // Serial numbers are case-sensitive identifiers, so the serial column is
    // matched exactly while the human-readable fields are matched loosely.
    const pattern = `%${q}%`;
    clauses.push(
      or(
        ilike(assets.code, pattern),
        ilike(assets.category, pattern),
        ilike(assets.brand, pattern),
        ilike(assets.model, pattern),
        ilike(assets.serial, pattern),
        ilike(assets.remarks, pattern),
        ilike(locations.name, pattern),
        ilike(departments.name, pattern),
        ilike(suppliers.name, pattern),
        eq(assets.serial, q),
      ),
    );
  }

  if (filters.category) {
    clauses.push(eq(assets.category, filters.category));
  }

  if (filters.status) {
    clauses.push(eq(assets.status, filters.status as Asset["status"]));
  }

  if (filters.locationId !== undefined) {
    clauses.push(eq(assets.locationId, filters.locationId));
  }

  if (filters.departmentId !== undefined) {
    clauses.push(eq(assets.departmentId, filters.departmentId));
  }

  const combined = and(...clauses.filter((clause): clause is SQL => clause !== undefined));

  return combined ? sql`${combined}` : undefined;
}

function orderBy(filters: AssetFilters) {
  const column = SORT_COLUMNS[filters.sort ?? "code"];
  return filters.direction === "desc" ? desc(column) : asc(column);
}

/* ------------------------------------------------------------------ reads --- */

export async function listAssets(filters: AssetFilters = {}): Promise<Asset[]> {
  const rows = await db
    .select(ASSET_SELECT)
    .from(assets)
    .leftJoin(locations, eq(assets.locationId, locations.id))
    .leftJoin(departments, eq(assets.departmentId, departments.id))
    .leftJoin(suppliers, eq(assets.supplierId, suppliers.id))
    .where(buildWhere(filters))
    .orderBy(orderBy(filters));

  return rows.map(toAsset);
}

/** A page of assets plus the totals the pager needs. */
export async function listAssetsPaginated(
  filters: AssetFilters = {},
): Promise<Paginated<Asset>> {
  const pageSize = Math.min(Math.max(filters.pageSize ?? 25, 5), 200);
  const requested = Math.max(filters.page ?? 1, 1);
  const where = buildWhere(filters);

  const [rows, totals] = await Promise.all([
    db
      .select(ASSET_SELECT)
      .from(assets)
      .leftJoin(locations, eq(assets.locationId, locations.id))
      .leftJoin(departments, eq(assets.departmentId, departments.id))
      .leftJoin(suppliers, eq(assets.supplierId, suppliers.id))
      .where(where)
      .orderBy(orderBy(filters))
      .limit(pageSize)
      .offset((requested - 1) * pageSize),
    db
      .select({ value: count() })
      .from(assets)
      .leftJoin(locations, eq(assets.locationId, locations.id))
      .leftJoin(departments, eq(assets.departmentId, departments.id))
      .leftJoin(suppliers, eq(assets.supplierId, suppliers.id))
      .where(where),
  ]);

  const total = totals[0]?.value ?? 0;
  const pageCount = Math.max(Math.ceil(total / pageSize), 1);
  // A page number past the end (e.g. after deleting the last row) clamps to the last page.
  const page = Math.min(requested, pageCount);

  return {
    rows: rows.map(toAsset),
    total,
    page,
    pageSize,
    pageCount,
  };
}

export async function getAssetById(id: number): Promise<Asset | null> {
  const [row] = await db
    .select(ASSET_SELECT)
    .from(assets)
    .leftJoin(locations, eq(assets.locationId, locations.id))
    .leftJoin(departments, eq(assets.departmentId, departments.id))
    .leftJoin(suppliers, eq(assets.supplierId, suppliers.id))
    .where(eq(assets.id, id))
    .limit(1);

  return row ? toAsset(row) : null;
}

export async function getAssetByCode(code: string): Promise<Asset | null> {
  const [row] = await db
    .select(ASSET_SELECT)
    .from(assets)
    .leftJoin(locations, eq(assets.locationId, locations.id))
    .leftJoin(departments, eq(assets.departmentId, departments.id))
    .leftJoin(suppliers, eq(assets.supplierId, suppliers.id))
    .where(eq(assets.code, code))
    .limit(1);

  return row ? toAsset(row) : null;
}

export async function getAssetSummary(): Promise<AssetSummary> {
  const [row] = await db
    .select({
      total: count(),
      active: sql<number>`count(*) filter (where ${assets.status} = 'Active')::int`,
      assigned: sql<number>`count(*) filter (where ${assets.status} = 'Assigned')::int`,
      broken: sql<number>`count(*) filter (where ${assets.status} = 'Broken')::int`,
      inMaintenance: sql<number>`count(*) filter (where ${assets.status} = 'Maintenance')::int`,
      totalValue: sql<string>`coalesce(sum(${assets.purchasePrice}), 0)::numeric(14,2)`,
    })
    .from(assets);

  return {
    total: row?.total ?? 0,
    active: row?.active ?? 0,
    assigned: row?.assigned ?? 0,
    broken: row?.broken ?? 0,
    inMaintenance: row?.inMaintenance ?? 0,
    totalValue: Number(row?.totalValue ?? 0),
  };
}

export async function getAssetFormOptions(): Promise<AssetFormOptions> {
  const [categoryRows, locationRows, departmentRows, supplierRows] = await Promise.all([
    db
      .selectDistinct({ name: assets.category })
      .from(assets)
      .orderBy(asc(assets.category)),
    db.select({ id: locations.id, name: locations.name }).from(locations).orderBy(asc(locations.name)),
    db
      .select({ id: departments.id, name: departments.name })
      .from(departments)
      .orderBy(asc(departments.name)),
    db
      .select({ id: suppliers.id, name: suppliers.name })
      .from(suppliers)
      .orderBy(asc(suppliers.name)),
  ]);

  return {
    categories: categoryRows.map((row) => row.name),
    locations: locationRows,
    departments: departmentRows,
    suppliers: supplierRows,
  };
}

/** Distinct values for the register's filter dropdowns. */
export async function getAssetFacets(): Promise<{
  categories: string[];
  statuses: string[];
  locations: { id: number; name: string }[];
  departments: { id: number; name: string }[];
}> {
  const options = await getAssetFormOptions();

  return {
    categories: options.categories,
    statuses: ["Active", "Assigned", "Maintenance", "Broken"],
    locations: options.locations,
    departments: options.departments,
  };
}

export async function getCategoryBreakdown(): Promise<Breakdown[]> {
  const rows = await db
    .select({ label: assets.category, value: count() })
    .from(assets)
    .groupBy(assets.category)
    .orderBy(desc(count()));

  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return rows.map((row) => ({
    label: row.label,
    value: row.value,
    percent: total === 0 ? 0 : Math.round((row.value / total) * 100),
  }));
}

export async function getLocationBreakdown(): Promise<Breakdown[]> {
  const rows = await db
    .select({ label: locations.name, value: count() })
    .from(assets)
    .innerJoin(locations, eq(assets.locationId, locations.id))
    .groupBy(locations.name)
    .orderBy(desc(count()));

  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return rows.map((row) => ({
    label: row.label,
    value: row.value,
    percent: total === 0 ? 0 : Math.round((row.value / total) * 100),
  }));
}

/** Category totals with purchase value, for the Equipment page and reports. */
export async function getCategoryStats(): Promise<CategoryStat[]> {
  const rows = await db
    .select({
      label: assets.category,
      count: count(),
      value: sql<string>`coalesce(sum(${assets.purchasePrice}), 0)::numeric(14,2)`,
    })
    .from(assets)
    .groupBy(assets.category)
    .orderBy(desc(count()));

  return rows.map((row) => ({
    label: row.label,
    count: row.count,
    value: Number(row.value),
  }));
}

export async function getStatusBreakdown(): Promise<Breakdown[]> {
  const rows = await db
    .select({ label: assets.status, value: count() })
    .from(assets)
    .groupBy(assets.status)
    .orderBy(desc(count()));

  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return rows.map((row) => ({
    label: row.label,
    value: row.value,
    percent: total === 0 ? 0 : Math.round((row.value / total) * 100),
  }));
}

export async function getDepartmentBreakdown(): Promise<Breakdown[]> {
  const rows = await db
    .select({ label: departments.name, value: count() })
    .from(assets)
    .innerJoin(departments, eq(assets.departmentId, departments.id))
    .groupBy(departments.name)
    .orderBy(desc(count()));

  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return rows.map((row) => ({
    label: row.label,
    value: row.value,
    percent: total === 0 ? 0 : Math.round((row.value / total) * 100),
  }));
}

/** Next free asset code, honouring the prefix configured in Settings. */
export async function getNextAssetCode(): Promise<string> {
  const { assetCodePrefix } = await getSettings();

  const [row] = await db
    .select({ highest: sql<string>`coalesce(max(substring(${assets.code} from '[0-9]+$')::int), 0)::text` })
    .from(assets);

  const next = Number(row?.highest ?? 0) + 1;

  return `${assetCodePrefix}${String(next).padStart(5, "0")}`;
}

/* -------------------------------------------------------------- mutations --- */

export interface AssetInput {
  code: string;
  category: string;
  brand: string;
  model: string;
  serial: string;
  locationId: number | null;
  departmentId: number | null;
  supplierId: number | null;
  status: Asset["status"];
  condition: Asset["condition"];
  availability: Asset["availability"];
  purchasePrice: number | null;
  purchaseDate: string | null;
  remarks: string;
}

function validate(input: AssetInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (input.code.trim() === "") {
    errors.code = "Asset code is required.";
  }

  if (input.category.trim() === "") {
    errors.category = "Category is required.";
  }

  if (input.purchasePrice !== null && input.purchasePrice < 0) {
    errors.purchasePrice = "Purchase price cannot be negative.";
  }

  if (input.purchaseDate !== null && Number.isNaN(Date.parse(input.purchaseDate))) {
    errors.purchaseDate = "Purchase date is not a valid date.";
  }

  return errors;
}

export async function insertAsset(input: AssetInput): Promise<FormState> {
  const fieldErrors = validate(input);

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors };
  }

  const existing = await getAssetByCode(input.code.trim());

  if (existing) {
    return {
      status: "error",
      message: `Asset code ${input.code.trim()} is already in use.`,
      fieldErrors: { code: "This asset code already exists." },
    };
  }

  await db.insert(assets).values({
    code: input.code.trim(),
    category: input.category.trim(),
    brand: input.brand.trim(),
    model: input.model.trim(),
    serial: input.serial.trim(),
    locationId: input.locationId,
    departmentId: input.departmentId,
    supplierId: input.supplierId,
    status: input.status,
    condition: input.condition,
    availability: input.availability,
    purchasePrice: input.purchasePrice === null ? null : input.purchasePrice.toFixed(2),
    purchaseDate: input.purchaseDate,
    remarks: input.remarks.trim(),
  });

  return { status: "success", message: `Asset ${input.code.trim()} registered.`, fieldErrors: {} };
}

export async function updateAsset(id: number, input: AssetInput): Promise<FormState> {
  const fieldErrors = validate(input);

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors };
  }

  const clash = await getAssetByCode(input.code.trim());

  if (clash && clash.id !== id) {
    return {
      status: "error",
      message: `Asset code ${input.code.trim()} is already in use.`,
      fieldErrors: { code: "This asset code already exists." },
    };
  }

  await db
    .update(assets)
    .set({
      code: input.code.trim(),
      category: input.category.trim(),
      brand: input.brand.trim(),
      model: input.model.trim(),
      serial: input.serial.trim(),
      locationId: input.locationId,
      departmentId: input.departmentId,
      supplierId: input.supplierId,
      status: input.status,
      condition: input.condition,
      availability: input.availability,
      purchasePrice: input.purchasePrice === null ? null : input.purchasePrice.toFixed(2),
      purchaseDate: input.purchaseDate,
      remarks: input.remarks.trim(),
      updatedAt: new Date(),
    })
    .where(eq(assets.id, id));

  return { status: "success", message: `Asset ${input.code.trim()} updated.`, fieldErrors: {} };
}

/** Deletes an asset; related records cascade away with it. */
export async function deleteAsset(id: number): Promise<FormState> {
  const asset = await getAssetById(id);

  if (!asset) {
    return { status: "error", message: "That asset no longer exists.", fieldErrors: {} };
  }

  await db.delete(assets).where(eq(assets.id, id));

  return { status: "success", message: `Asset ${asset.code} deleted.`, fieldErrors: {} };
}
