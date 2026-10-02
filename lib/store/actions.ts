"use server";

import { revalidatePath } from "next/cache";

import { assertCanWrite } from "@/lib/auth/actions";
import { publish, type RealtimeTopic } from "@/lib/realtime/bus";
import {
  insertAssignment,
  insertBroken,
  insertMaintenance,
  insertTransfer,
  returnAssignment,
  setAuditResult,
  setBrokenStatus,
  setMaintenanceStatus,
  startAudit,
} from "@/lib/store/operations";
import type { AuditResult, BrokenStatus, FormState, MaintenanceStatus, TransferStatus } from "@/lib/types";

/* --------------------------------------------------------------- helpers --- */

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function number(formData: FormData, name: string): number | null {
  const raw = text(formData, name);
  if (raw === "") {
    return null;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function revalidateOperations(): void {
  for (const path of [
    "/assignments",
    "/transfers",
    "/maintenance",
    "/broken",
    "/audit",
    "/dashboard",
    "/assets",
  ]) {
    revalidatePath(path);
  }
}

/**
 * Broadcasts a change to live subscribers. Operations generally also change the
 * underlying asset (status, location, holder), so we announce that too.
 */
function announce(topic: RealtimeTopic, action: "created" | "updated", id?: number): void {
  publish({ topic, action, id });
  if (topic !== "assets") {
    publish({ topic: "assets", action: "updated", id });
  }
}

/* ----------------------------------------------------------- assignments --- */

export async function createAssignmentAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertCanWrite();

  const state = await insertAssignment({
    assetId: Number(formData.get("assetId") ?? 0),
    userId: number(formData, "userId"),
    departmentId: number(formData, "departmentId"),
    locationId: number(formData, "locationId"),
    assignedDate: text(formData, "assignedDate"),
    notes: text(formData, "notes"),
  });

  if (state.status === "success") {
    revalidateOperations();
    announce("assignments", "created");
  }

  return state;
}

export async function returnAssignmentAction(formData: FormData): Promise<void> {
  await assertCanWrite();
  const id = Number(formData.get("id") ?? 0);
  await returnAssignment(id);
  revalidateOperations();
  announce("assignments", "updated", id);
}

/* ------------------------------------------------------------- transfers --- */

export async function createTransferAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertCanWrite();

  const state = await insertTransfer({
    assetId: Number(formData.get("assetId") ?? 0),
    fromLocationId: number(formData, "fromLocationId"),
    toLocationId: number(formData, "toLocationId"),
    transferDate: text(formData, "transferDate"),
    transferredBy: number(formData, "transferredBy"),
    status: (text(formData, "status") || "Completed") as TransferStatus,
    notes: text(formData, "notes"),
  });

  if (state.status === "success") {
    revalidateOperations();
    announce("transfers", "created");
  }

  return state;
}

/* ----------------------------------------------------------- maintenance --- */

export async function createMaintenanceAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertCanWrite();

  const state = await insertMaintenance({
    assetId: Number(formData.get("assetId") ?? 0),
    problem: text(formData, "problem"),
    requestDate: text(formData, "requestDate"),
    technician: text(formData, "technician"),
    cost: number(formData, "cost") ?? 0,
    status: (text(formData, "status") || "Open") as MaintenanceStatus,
    notes: text(formData, "notes"),
  });

  if (state.status === "success") {
    revalidateOperations();
    announce("maintenance", "created");
  }

  return state;
}

export async function updateMaintenanceStatusAction(formData: FormData): Promise<void> {
  await assertCanWrite();
  const id = Number(formData.get("id") ?? 0);
  await setMaintenanceStatus(
    id,
    String(formData.get("status") ?? "") as MaintenanceStatus,
  );
  revalidateOperations();
  announce("maintenance", "updated", id);
}

/* ----------------------------------------------------------------- broken --- */

export async function createBrokenAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertCanWrite();

  const state = await insertBroken({
    assetId: Number(formData.get("assetId") ?? 0),
    problem: text(formData, "problem"),
    locationId: number(formData, "locationId"),
    reportedDate: text(formData, "reportedDate"),
    action: text(formData, "action"),
    status: (text(formData, "status") || "Broken") as BrokenStatus,
    notes: text(formData, "notes"),
  });

  if (state.status === "success") {
    revalidateOperations();
    announce("broken", "created");
  }

  return state;
}

export async function updateBrokenStatusAction(formData: FormData): Promise<void> {
  await assertCanWrite();
  const id = Number(formData.get("id") ?? 0);
  await setBrokenStatus(
    id,
    String(formData.get("status") ?? "") as BrokenStatus,
  );
  revalidateOperations();
  announce("broken", "updated", id);
}

/* ------------------------------------------------------------------ audit --- */

export async function startAuditAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertCanWrite();

  const auditor = text(formData, "auditor");
  const limit = number(formData, "limit") ?? 50;
  const state = await startAudit(limit, auditor);

  if (state.status === "success") {
    revalidatePath("/audit");
    announce("audit", "created");
  }

  return state;
}

export async function setAuditResultAction(formData: FormData): Promise<void> {
  await assertCanWrite();
  await setAuditResult(
    Number(formData.get("assetId") ?? 0),
    String(formData.get("result") ?? "") as AuditResult,
    String(formData.get("auditor") ?? "").trim(),
    String(formData.get("notes") ?? "").trim(),
  );
  revalidatePath("/audit");
  announce("audit", "updated");
}
