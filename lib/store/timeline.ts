import { and, desc, eq } from "drizzle-orm";
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
  AssignmentRecord,
  AuditRecord,
  BrokenRecord,
  MaintenanceRecord,
  TransferRecord,
} from "@/lib/types";

export interface AssetTimeline {
  assignments: AssignmentRecord[];
  transfers: TransferRecord[];
  maintenance: MaintenanceRecord[];
  broken: BrokenRecord[];
  audits: AuditRecord[];
}

/** Everything the asset detail page shows, newest first within each group. */
export async function getAssetTimeline(assetId: number): Promise<AssetTimeline> {
  // `from` and `to` both point at locations, so the table needs two aliases.
  const toLocations = alias(locations, "to_location");

  const [assetRows, assignmentRows, transferRows, maintenanceRows, brokenRows, auditRows] =
    await Promise.all([
      db
        .select({ code: assets.code, brand: assets.brand, model: assets.model, location: locations.name })
        .from(assets)
        .leftJoin(locations, eq(assets.locationId, locations.id))
        .where(eq(assets.id, assetId))
        .limit(1),
      db
        .select({
          id: assignments.id,
          assignedDate: assignments.assignedDate,
          returnedDate: assignments.returnedDate,
          assignee: users.name,
          department: departments.name,
          notes: assignments.notes,
          status: assignments.status,
        })
        .from(assignments)
        .leftJoin(users, eq(assignments.userId, users.id))
        .leftJoin(departments, eq(assignments.departmentId, departments.id))
        .where(eq(assignments.assetId, assetId))
        .orderBy(desc(assignments.assignedDate)),
      db
        .select({
          id: transfers.id,
          from: locations.name,
          to: toLocations.name,
          transferDate: transfers.transferDate,
          movedBy: users.name,
          status: transfers.status,
          notes: transfers.notes,
        })
        .from(transfers)
        .leftJoin(locations, eq(transfers.fromLocationId, locations.id))
        .leftJoin(toLocations, eq(transfers.toLocationId, toLocations.id))
        .leftJoin(users, eq(transfers.transferredBy, users.id))
        .where(eq(transfers.assetId, assetId))
        .orderBy(desc(transfers.transferDate)),
      db
        .select({
          id: maintenance.id,
          problem: maintenance.problem,
          requestDate: maintenance.requestDate,
          technician: maintenance.technician,
          cost: maintenance.cost,
          status: maintenance.status,
          completedDate: maintenance.completedDate,
          notes: maintenance.notes,
        })
        .from(maintenance)
        .where(eq(maintenance.assetId, assetId))
        .orderBy(desc(maintenance.requestDate)),
      db
        .select({
          id: brokenItems.id,
          problem: brokenItems.problem,
          reportedDate: brokenItems.reportedDate,
          action: brokenItems.action,
          status: brokenItems.status,
          notes: brokenItems.notes,
          location: locations.name,
        })
        .from(brokenItems)
        .leftJoin(locations, eq(brokenItems.locationId, locations.id))
        .where(eq(brokenItems.assetId, assetId))
        .orderBy(desc(brokenItems.reportedDate)),
      db
        .select({
          id: audits.id,
          auditDate: audits.auditDate,
          auditor: audits.auditor,
          result: audits.result,
          notes: audits.notes,
        })
        .from(audits)
        .where(eq(audits.assetId, assetId))
        .orderBy(desc(audits.auditDate)),
    ]);

  const asset = assetRows[0];
  const code = asset?.code ?? "";
  const label = `${code} · ${`${asset?.brand ?? ""} ${asset?.model ?? ""}`.trim()}`;
  const currentLocation = asset?.location ?? "";

  return {
    assignments: assignmentRows.map((row) => ({
      id: row.id,
      assetId,
      asset: label,
      assignee: row.assignee ?? "",
      department: row.department ?? "",
      location: currentLocation,
      date: row.assignedDate,
      returnedDate: row.returnedDate ?? "",
      status: row.status,
      notes: row.notes,
    })),
    transfers: transferRows.map((row) => ({
      id: row.id,
      code,
      from: row.from ?? "",
      to: row.to ?? "",
      date: row.transferDate,
      by: row.movedBy ?? "",
      status: row.status,
      notes: row.notes,
    })),
    maintenance: maintenanceRows.map((row) => ({
      id: row.id,
      code,
      assetId,
      problem: row.problem,
      date: row.requestDate,
      technician: row.technician,
      cost: Number(row.cost),
      status: row.status,
      completedDate: row.completedDate ?? "",
      notes: row.notes,
    })),
    broken: brokenRows.map((row) => ({
      id: row.id,
      assetId,
      asset: label,
      problem: row.problem,
      location: row.location ?? "",
      reportedDate: row.reportedDate,
      action: row.action,
      status: row.status,
      notes: row.notes,
    })),
    audits: auditRows.map((row) => ({
      id: row.id,
      assetId,
      code,
      asset: label,
      location: currentLocation,
      auditDate: row.auditDate,
      auditor: row.auditor,
      result: row.result,
      notes: row.notes,
    })),
  };
}

/** Finds an asset by its human code, for QR/barcode deep links. */
export async function findAssetIdByCode(code: string): Promise<number | null> {
  const [row] = await db
    .select({ id: assets.id })
    .from(assets)
    .where(eq(assets.code, code))
    .limit(1);

  return row?.id ?? null;
}

/** True when the asset has an assignment that has not been returned. */
export async function hasOpenAssignment(assetId: number): Promise<boolean> {
  const [row] = await db
    .select({ id: assignments.id })
    .from(assignments)
    .where(and(eq(assignments.assetId, assetId), eq(assignments.status, "Assigned")))
    .limit(1);

  return row !== undefined;
}
