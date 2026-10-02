import { and, count, desc, eq, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/lib/db";
import {
  assets,
  assignments,
  audits,
  brokenItems,
  departments,
  locations,
  maintenance,
  transfers,
  users,
} from "@/lib/db/schema";
import type {
  ActivityRecord,
  AssignmentRecord,
  AssignmentStatus,
  AssetStatus,
  AuditRecord,
  AuditResult,
  AuditSummary,
  BrokenRecord,
  BrokenStatus,
  FormState,
  MaintenanceRecord,
  MaintenanceStatus,
  MaintenanceSummary,
  TransferRecord,
  TransferStatus,
} from "@/lib/types";

/* ------------------------------------------------------------ recent feed --- */

interface ActivitySource {
  date: string;
  action: string;
  user: string;
  code: string;
  asset: string;
  status: ActivityRecord["status"];
}

/**
 * Recent activity is derived from the operational tables rather than kept in its
 * own log, so it can never drift out of sync with the records it describes.
 */
export async function listRecentActivity(limit = 8): Promise<ActivityRecord[]> {
  const [assignmentRows, transferRows, maintenanceRows, createdRows] = await Promise.all([
    db
      .select({
        date: assignments.assignedDate,
        action: sql<string>`'Assigned'`,
        user: users.name,
        code: assets.code,
        brand: assets.brand,
        model: assets.model,
        status: assets.status,
      })
      .from(assignments)
      .innerJoin(assets, eq(assignments.assetId, assets.id))
      .leftJoin(users, eq(assignments.userId, users.id))
      .orderBy(desc(assignments.assignedDate))
      .limit(limit),
    db
      .select({
        date: transfers.transferDate,
        action: sql<string>`'Transferred'`,
        user: users.name,
        code: assets.code,
        brand: assets.brand,
        model: assets.model,
        status: assets.status,
      })
      .from(transfers)
      .innerJoin(assets, eq(transfers.assetId, assets.id))
      .leftJoin(users, eq(transfers.transferredBy, users.id))
      .orderBy(desc(transfers.transferDate))
      .limit(limit),
    db
      .select({
        date: maintenance.requestDate,
        action: sql<string>`'Maintenance'`,
        user: maintenance.technician,
        code: assets.code,
        brand: assets.brand,
        model: assets.model,
        status: assets.status,
      })
      .from(maintenance)
      .innerJoin(assets, eq(maintenance.assetId, assets.id))
      .orderBy(desc(maintenance.requestDate))
      .limit(limit),
    db
      .select({
        date: sql<string>`to_char(${assets.createdAt}::date, 'YYYY-MM-DD')`,
        action: sql<string>`'Registered'`,
        user: sql<string>`'System'`,
        code: assets.code,
        brand: assets.brand,
        model: assets.model,
        status: assets.status,
      })
      .from(assets)
      .orderBy(desc(assets.createdAt))
      .limit(limit),
  ]);

  const merged: ActivitySource[] = [
    ...assignmentRows,
    ...transferRows,
    ...maintenanceRows,
    ...createdRows,
  ]
    .map((row) => ({
      date: String(row.date),
      action: row.action,
      user: row.user ?? "",
      code: row.code,
      asset: `${row.brand} ${row.model}`.trim(),
      status: row.status,
    }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return merged.slice(0, limit);
}

/* ------------------------------------------------------------ assignments --- */

export async function listAssignments(): Promise<AssignmentRecord[]> {
  const rows = await db
    .select({
      id: assignments.id,
      assetId: assignments.assetId,
      code: assets.code,
      brand: assets.brand,
      model: assets.model,
      assignee: users.name,
      department: departments.name,
      location: locations.name,
      assignedDate: assignments.assignedDate,
      returnedDate: assignments.returnedDate,
      status: assignments.status,
      notes: assignments.notes,
    })
    .from(assignments)
    .innerJoin(assets, eq(assignments.assetId, assets.id))
    .leftJoin(users, eq(assignments.userId, users.id))
    .leftJoin(departments, eq(assignments.departmentId, departments.id))
    .leftJoin(locations, eq(assignments.locationId, locations.id))
    .orderBy(desc(assignments.assignedDate));

  return rows.map((row) => ({
    id: row.id,
    assetId: row.assetId,
    asset: `${row.code} · ${`${row.brand} ${row.model}`.trim()}`,
    assignee: row.assignee ?? "Unassigned",
    department: row.department ?? "",
    location: row.location ?? "",
    date: row.assignedDate,
    returnedDate: row.returnedDate ?? "",
    status: row.status,
    notes: row.notes,
  }));
}

export interface AssignmentInput {
  assetId: number;
  userId: number | null;
  departmentId: number | null;
  locationId: number | null;
  assignedDate: string;
  notes: string;
}

export async function insertAssignment(input: AssignmentInput): Promise<FormState> {
  if (!Number.isInteger(input.assetId) || input.assetId <= 0) {
    return {
      status: "error",
      message: "Choose an asset to assign.",
      fieldErrors: { assetId: "Asset is required." },
    };
  }

  if (Number.isNaN(Date.parse(input.assignedDate))) {
    return {
      status: "error",
      message: "Enter a valid assignment date.",
      fieldErrors: { assignedDate: "A valid date is required." },
    };
  }

  const [asset] = await db
    .select({ code: assets.code, status: assets.status })
    .from(assets)
    .where(eq(assets.id, input.assetId))
    .limit(1);

  if (!asset) {
    return { status: "error", message: "That asset no longer exists.", fieldErrors: {} };
  }

  const active = await db
    .select({ id: assignments.id })
    .from(assignments)
    .where(
      and(
        eq(assignments.assetId, input.assetId),
        eq(assignments.status, "Assigned" satisfies AssignmentStatus),
      ),
    )
    .limit(1);

  if (active.length > 0) {
    return {
      status: "error",
      message: `${asset.code} is already assigned. Return it first.`,
      fieldErrors: { assetId: "This asset is already assigned." },
    };
  }

  await db.insert(assignments).values({
    assetId: input.assetId,
    userId: input.userId,
    departmentId: input.departmentId,
    locationId: input.locationId,
    assignedDate: input.assignedDate,
    status: "Assigned",
    notes: input.notes.trim(),
  });

  await db
    .update(assets)
    .set({ status: "Assigned", availability: "Assigned", updatedAt: new Date() })
    .where(eq(assets.id, input.assetId));

  return { status: "success", message: `${asset.code} assigned.`, fieldErrors: {} };
}

export async function returnAssignment(id: number): Promise<FormState> {
  const [row] = await db
    .select({ assetId: assignments.assetId, code: assets.code })
    .from(assignments)
    .innerJoin(assets, eq(assignments.assetId, assets.id))
    .where(eq(assignments.id, id))
    .limit(1);

  if (!row) {
    return { status: "error", message: "That assignment no longer exists.", fieldErrors: {} };
  }

  await db
    .update(assignments)
    .set({ status: "Returned", returnedDate: new Date().toISOString().slice(0, 10) })
    .where(eq(assignments.id, id));

  await db
    .update(assets)
    .set({ status: "Active", availability: "Available", updatedAt: new Date() })
    .where(eq(assets.id, row.assetId));

  return { status: "success", message: `${row.code} returned to the store.`, fieldErrors: {} };
}

/* -------------------------------------------------------------- transfers --- */

export async function listTransfers(): Promise<TransferRecord[]> {
  // `from` and `to` both point at locations, so the table needs two aliases.
  const toLocations = alias(locations, "to_location");

  const rows = await db
    .select({
      id: transfers.id,
      code: assets.code,
      from: locations.name,
      to: toLocations.name,
      transferDate: transfers.transferDate,
      by: users.name,
      status: transfers.status,
      notes: transfers.notes,
    })
    .from(transfers)
    .innerJoin(assets, eq(transfers.assetId, assets.id))
    .leftJoin(locations, eq(transfers.fromLocationId, locations.id))
    .leftJoin(toLocations, eq(transfers.toLocationId, toLocations.id))
    .leftJoin(users, eq(transfers.transferredBy, users.id))
    .orderBy(desc(transfers.transferDate));

  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    from: row.from ?? "",
    to: row.to ?? "",
    date: row.transferDate,
    by: row.by ?? "",
    status: row.status,
    notes: row.notes,
  }));
}

export interface TransferInput {
  assetId: number;
  fromLocationId: number | null;
  toLocationId: number | null;
  transferDate: string;
  transferredBy: number | null;
  status: TransferStatus;
  notes: string;
}

export async function insertTransfer(input: TransferInput): Promise<FormState> {
  const fieldErrors: Record<string, string> = {};

  if (!Number.isInteger(input.assetId) || input.assetId <= 0) {
    fieldErrors.assetId = "Asset is required.";
  }

  if (input.toLocationId === null) {
    fieldErrors.toLocationId = "Destination is required.";
  }

  if (
    input.fromLocationId !== null &&
    input.toLocationId !== null &&
    input.fromLocationId === input.toLocationId
  ) {
    fieldErrors.toLocationId = "Destination must differ from the current location.";
  }

  if (Number.isNaN(Date.parse(input.transferDate))) {
    fieldErrors.transferDate = "A valid date is required.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors };
  }

  const [asset] = await db
    .select({ code: assets.code, locationId: assets.locationId })
    .from(assets)
    .where(eq(assets.id, input.assetId))
    .limit(1);

  if (!asset) {
    return { status: "error", message: "That asset no longer exists.", fieldErrors: {} };
  }

  await db.insert(transfers).values({
    assetId: input.assetId,
    fromLocationId: input.fromLocationId ?? asset.locationId,
    toLocationId: input.toLocationId,
    transferDate: input.transferDate,
    transferredBy: input.transferredBy,
    status: input.status,
    notes: input.notes.trim(),
  });

  if (input.status === "Completed") {
    await db
      .update(assets)
      .set({ locationId: input.toLocationId, updatedAt: new Date() })
      .where(eq(assets.id, input.assetId));
  }

  return { status: "success", message: `Transfer for ${asset.code} recorded.`, fieldErrors: {} };
}

/* ------------------------------------------------------------ maintenance --- */

export async function listMaintenance(): Promise<MaintenanceRecord[]> {
  const rows = await db
    .select({
      id: maintenance.id,
      assetId: maintenance.assetId,
      code: assets.code,
      problem: maintenance.problem,
      requestDate: maintenance.requestDate,
      technician: maintenance.technician,
      cost: maintenance.cost,
      status: maintenance.status,
      completedDate: maintenance.completedDate,
      notes: maintenance.notes,
    })
    .from(maintenance)
    .innerJoin(assets, eq(maintenance.assetId, assets.id))
    .orderBy(desc(maintenance.requestDate));

  return rows.map((row) => ({
    id: row.id,
    assetId: row.assetId,
    code: row.code,
    problem: row.problem,
    date: row.requestDate,
    technician: row.technician,
    cost: Number(row.cost),
    status: row.status,
    completedDate: row.completedDate ?? "",
    notes: row.notes,
  }));
}

export async function getMaintenanceSummary(): Promise<MaintenanceSummary> {
  const [row] = await db
    .select({
      open: sql<number>`count(*) filter (where ${maintenance.status} = 'Open')::int`,
      inProgress: sql<number>`count(*) filter (where ${maintenance.status} = 'In Progress')::int`,
      completed: sql<number>`count(*) filter (where ${maintenance.status} = 'Completed')::int`,
      totalCost: sql<string>`coalesce(sum(${maintenance.cost}), 0)::numeric(14,2)`,
    })
    .from(maintenance);

  return {
    open: row?.open ?? 0,
    inProgress: row?.inProgress ?? 0,
    completed: row?.completed ?? 0,
    totalCost: Number(row?.totalCost ?? 0),
  };
}

export interface MaintenanceInput {
  assetId: number;
  problem: string;
  requestDate: string;
  technician: string;
  cost: number | null;
  status: MaintenanceStatus;
  notes: string;
}

export async function insertMaintenance(input: MaintenanceInput): Promise<FormState> {
  const fieldErrors: Record<string, string> = {};

  if (!Number.isInteger(input.assetId) || input.assetId <= 0) {
    fieldErrors.assetId = "Asset is required.";
  }

  if (input.problem.trim() === "") {
    fieldErrors.problem = "Describe the problem.";
  }

  if (Number.isNaN(Date.parse(input.requestDate))) {
    fieldErrors.requestDate = "A valid date is required.";
  }

  if (input.cost !== null && input.cost < 0) {
    fieldErrors.cost = "Cost cannot be negative.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors };
  }

  const [asset] = await db
    .select({ code: assets.code })
    .from(assets)
    .where(eq(assets.id, input.assetId))
    .limit(1);

  if (!asset) {
    return { status: "error", message: "That asset no longer exists.", fieldErrors: {} };
  }

  await db.insert(maintenance).values({
    assetId: input.assetId,
    problem: input.problem.trim(),
    requestDate: input.requestDate,
    technician: input.technician.trim(),
    cost: input.cost === null ? "0.00" : input.cost.toFixed(2),
    status: input.status,
    completedDate: input.status === "Completed" ? input.requestDate : null,
    notes: input.notes.trim(),
  });

  if (input.status === "Open" || input.status === "In Progress") {
    await db
      .update(assets)
      .set({ status: "Maintenance", updatedAt: new Date() })
      .where(eq(assets.id, input.assetId));
  }

  return { status: "success", message: `Maintenance logged for ${asset.code}.`, fieldErrors: {} };
}

const MAINTENANCE_TRANSITIONS: Record<MaintenanceStatus, AssetStatus> = {
  Open: "Maintenance",
  "In Progress": "Maintenance",
  Completed: "Active",
};

export async function setMaintenanceStatus(
  id: number,
  status: MaintenanceStatus,
): Promise<FormState> {
  const [row] = await db
    .select({
      assetId: maintenance.assetId,
      code: assets.code,
      status: maintenance.status,
    })
    .from(maintenance)
    .innerJoin(assets, eq(maintenance.assetId, assets.id))
    .where(eq(maintenance.id, id))
    .limit(1);

  if (!row) {
    return { status: "error", message: "That record no longer exists.", fieldErrors: {} };
  }

  await db
    .update(maintenance)
    .set({
      status,
      completedDate: status === "Completed" ? new Date().toISOString().slice(0, 10) : null,
    })
    .where(eq(maintenance.id, id));

  // Completing the last open job for an asset returns it to Active.
  const stillOpen = await db
    .select({ id: maintenance.id })
    .from(maintenance)
    .where(
      and(
        eq(maintenance.assetId, row.assetId),
        sql`${maintenance.status} <> 'Completed'`,
      ),
    )
    .limit(1);

  if (stillOpen.length === 0) {
    await db
      .update(assets)
      .set({ status: MAINTENANCE_TRANSITIONS[status], updatedAt: new Date() })
      .where(eq(assets.id, row.assetId));
  }

  return { status: "success", message: `${row.code} maintenance set to ${status}.`, fieldErrors: {} };
}

export async function deleteMaintenance(id: number): Promise<FormState> {
  const [row] = await db
    .select({ code: assets.code })
    .from(maintenance)
    .innerJoin(assets, eq(maintenance.assetId, assets.id))
    .where(eq(maintenance.id, id))
    .limit(1);

  if (!row) {
    return { status: "error", message: "That record no longer exists.", fieldErrors: {} };
  }

  await db.delete(maintenance).where(eq(maintenance.id, id));

  return { status: "success", message: `Maintenance record for ${row.code} deleted.`, fieldErrors: {} };
}

/* ----------------------------------------------------------- broken items --- */

export async function listBroken(): Promise<BrokenRecord[]> {
  const rows = await db
    .select({
      id: brokenItems.id,
      assetId: brokenItems.assetId,
      code: assets.code,
      brand: assets.brand,
      model: assets.model,
      problem: brokenItems.problem,
      location: locations.name,
      reportedDate: brokenItems.reportedDate,
      action: brokenItems.action,
      status: brokenItems.status,
      notes: brokenItems.notes,
    })
    .from(brokenItems)
    .innerJoin(assets, eq(brokenItems.assetId, assets.id))
    .leftJoin(locations, eq(brokenItems.locationId, locations.id))
    .orderBy(desc(brokenItems.reportedDate));

  return rows.map((row) => ({
    id: row.id,
    assetId: row.assetId,
    asset: `${row.code} · ${`${row.brand} ${row.model}`.trim()}`,
    problem: row.problem,
    location: row.location ?? "",
    reportedDate: row.reportedDate,
    action: row.action,
    status: row.status,
    notes: row.notes,
  }));
}

export interface BrokenInput {
  assetId: number;
  problem: string;
  locationId: number | null;
  reportedDate: string;
  action: string;
  status: BrokenStatus;
  notes: string;
}

export async function insertBroken(input: BrokenInput): Promise<FormState> {
  const fieldErrors: Record<string, string> = {};

  if (!Number.isInteger(input.assetId) || input.assetId <= 0) {
    fieldErrors.assetId = "Asset is required.";
  }

  if (input.problem.trim() === "") {
    fieldErrors.problem = "Describe the fault.";
  }

  if (Number.isNaN(Date.parse(input.reportedDate))) {
    fieldErrors.reportedDate = "A valid date is required.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors };
  }

  const [asset] = await db
    .select({ code: assets.code, locationId: assets.locationId })
    .from(assets)
    .where(eq(assets.id, input.assetId))
    .limit(1);

  if (!asset) {
    return { status: "error", message: "That asset no longer exists.", fieldErrors: {} };
  }

  await db.insert(brokenItems).values({
    assetId: input.assetId,
    problem: input.problem.trim(),
    locationId: input.locationId ?? asset.locationId,
    reportedDate: input.reportedDate,
    action: input.action.trim(),
    status: input.status,
    notes: input.notes.trim(),
  });

  if (input.status !== "Resolved") {
    await db
      .update(assets)
      .set({ status: "Broken", updatedAt: new Date() })
      .where(eq(assets.id, input.assetId));
  }

  return { status: "success", message: `${asset.code} reported as broken.`, fieldErrors: {} };
}

export async function setBrokenStatus(id: number, status: BrokenStatus): Promise<FormState> {
  const [row] = await db
    .select({ assetId: brokenItems.assetId, code: assets.code })
    .from(brokenItems)
    .innerJoin(assets, eq(brokenItems.assetId, assets.id))
    .where(eq(brokenItems.id, id))
    .limit(1);

  if (!row) {
    return { status: "error", message: "That record no longer exists.", fieldErrors: {} };
  }

  await db
    .update(brokenItems)
    .set({
      status,
      resolvedDate: status === "Resolved" ? new Date().toISOString().slice(0, 10) : null,
    })
    .where(eq(brokenItems.id, id));

  if (status === "Resolved") {
    const otherOpen = await db
      .select({ id: brokenItems.id })
      .from(brokenItems)
      .where(
        and(
          eq(brokenItems.assetId, row.assetId),
          sql`${brokenItems.status} <> 'Resolved'`,
        ),
      )
      .limit(1);

    if (otherOpen.length === 0) {
      await db
        .update(assets)
        .set({ status: "Active", updatedAt: new Date() })
        .where(eq(assets.id, row.assetId));
    }
  }

  return { status: "success", message: `${row.code} marked ${status}.`, fieldErrors: {} };
}

export async function deleteBroken(id: number): Promise<FormState> {
  const [row] = await db
    .select({ code: assets.code })
    .from(brokenItems)
    .innerJoin(assets, eq(brokenItems.assetId, assets.id))
    .where(eq(brokenItems.id, id))
    .limit(1);

  if (!row) {
    return { status: "error", message: "That record no longer exists.", fieldErrors: {} };
  }

  await db.delete(brokenItems).where(eq(brokenItems.id, id));

  return { status: "success", message: `Broken report for ${row.code} deleted.`, fieldErrors: {} };
}

/* ------------------------------------------------------------------ audit --- */

export async function getAuditSummary(): Promise<AuditSummary> {
  const [totals] = await db.select({ total: count() }).from(assets);

  const [row] = await db
    .select({
      verified: sql<number>`count(*) filter (where ${audits.result} = 'Verified')::int`,
      missing: sql<number>`count(*) filter (where ${audits.result} = 'Missing')::int`,
      pending: sql<number>`count(*) filter (where ${audits.result} = 'Pending')::int`,
    })
    .from(audits);

  const total = totals?.total ?? 0;
  const verified = row?.verified ?? 0;
  const missing = row?.missing ?? 0;
  const pending = row?.pending ?? 0;

  return {
    toVerify: total,
    verified,
    missing,
    // Assets that have never been audited are pending too.
    pending: pending + Math.max(total - (verified + missing + pending), 0),
  };
}

export async function listAudits(result?: AuditResult): Promise<AuditRecord[]> {
  const where = result ? eq(audits.result, result) : undefined;

  const rows = await db
    .select({
      id: audits.id,
      assetId: audits.assetId,
      code: assets.code,
      brand: assets.brand,
      model: assets.model,
      location: locations.name,
      auditDate: audits.auditDate,
      auditor: audits.auditor,
      result: audits.result,
      notes: audits.notes,
    })
    .from(audits)
    .innerJoin(assets, eq(audits.assetId, assets.id))
    .leftJoin(locations, eq(assets.locationId, locations.id))
    .where(where)
    .orderBy(desc(audits.auditDate));

  return rows.map((row) => ({
    id: row.id,
    assetId: row.assetId,
    code: row.code,
    asset: `${row.brand} ${row.model}`.trim(),
    location: row.location ?? "",
    auditDate: row.auditDate,
    auditor: row.auditor,
    result: row.result,
    notes: row.notes,
  }));
}

/** Assets that have never been audited. */
export async function listUnauditedAssets(limit = 50): Promise<AuditRecord[]> {
  const rows = await db
    .select({
      id: assets.id,
      code: assets.code,
      brand: assets.brand,
      model: assets.model,
      location: locations.name,
    })
    .from(assets)
    .leftJoin(audits, eq(audits.assetId, assets.id))
    .leftJoin(locations, eq(assets.locationId, locations.id))
    .where(sql`${audits.id} is null`)
    .orderBy(assets.code)
    .limit(limit);

  return rows.map((row) => ({
    id: 0,
    assetId: row.id,
    code: row.code,
    asset: `${row.brand} ${row.model}`.trim(),
    location: row.location ?? "",
    auditDate: "",
    auditor: "",
    result: "Pending",
    notes: "",
  }));
}

export async function setAuditResult(
  assetId: number,
  result: AuditResult,
  auditor: string,
  notes: string,
): Promise<FormState> {
  const [asset] = await db
    .select({ code: assets.code })
    .from(assets)
    .where(eq(assets.id, assetId))
    .limit(1);

  if (!asset) {
    return { status: "error", message: "That asset no longer exists.", fieldErrors: {} };
  }

  await db
    .insert(audits)
    .values({
      assetId,
      auditDate: new Date().toISOString().slice(0, 10),
      auditor: auditor.trim(),
      result,
      notes: notes.trim(),
    })
    .onConflictDoUpdate({
      target: audits.assetId,
      set: {
        auditDate: new Date().toISOString().slice(0, 10),
        auditor: auditor.trim(),
        result,
        notes: notes.trim(),
      },
    });

  return { status: "success", message: `${asset.code} marked ${result}.`, fieldErrors: {} };
}

/** Creates Pending audit rows for every asset that has none. */
export async function startAudit(limit: number, auditor: string): Promise<FormState> {
  const unaudited = await db
    .select({ id: assets.id })
    .from(assets)
    .leftJoin(audits, eq(audits.assetId, assets.id))
    .where(isNull(audits.id))
    .orderBy(assets.code)
    .limit(Math.max(limit, 1));

  if (unaudited.length === 0) {
    return {
      status: "success",
      message: "Every asset already has an audit record.",
      fieldErrors: {},
    };
  }

  const today = new Date().toISOString().slice(0, 10);

  await db.insert(audits).values(
    unaudited.map((row) => ({
      assetId: row.id,
      auditDate: today,
      auditor: auditor.trim(),
      result: "Pending" as const,
      notes: "",
    })),
  );

  return {
    status: "success",
    message: `Audit started for ${unaudited.length} asset${unaudited.length === 1 ? "" : "s"}.`,
    fieldErrors: {},
  };
}
