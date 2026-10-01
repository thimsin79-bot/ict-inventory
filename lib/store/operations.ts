import { listAssets } from "@/lib/store/assets";
import type {
  ActivityRecord,
  AssignmentRecord,
  AuditSummary,
  BrokenRecord,
  MaintenanceRecord,
  MaintenanceSummary,
  TransferRecord,
} from "@/lib/types";

export async function listRecentActivity(): Promise<ActivityRecord[]> {
  return [];
}

export async function listAssignments(): Promise<AssignmentRecord[]> {
  return [];
}

export async function listTransfers(): Promise<TransferRecord[]> {
  return [];
}

export async function listMaintenance(): Promise<MaintenanceRecord[]> {
  return [];
}

export async function getMaintenanceSummary(): Promise<MaintenanceSummary> {
  const records = await listMaintenance();

  return {
    open: records.filter((record) => record.status === "Open").length,
    inProgress: records.filter((record) => record.status === "In Progress").length,
    completed: records.filter((record) => record.status === "Completed").length,
    totalCost: records.reduce((sum, record) => sum + record.cost, 0),
  };
}

export async function listBroken(): Promise<BrokenRecord[]> {
  return [];
}

export async function getAuditSummary(): Promise<AuditSummary> {
  const assets = await listAssets();
  const verified = 0;
  const missing = 0;

  return {
    toVerify: assets.length,
    verified,
    missing,
    pending: Math.max(assets.length - verified - missing, 0),
  };
}
