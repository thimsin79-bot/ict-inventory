import { count, desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { assets, departments, locations } from "@/lib/db/schema";
import { listAssets } from "@/lib/store/assets";
import { listBroken, listMaintenance } from "@/lib/store/operations";
import { getSettings } from "@/lib/store/settings";
import { formatCurrency, formatDate } from "@/lib/format";

export interface ReportColumn {
  key: string;
  label: string;
  align?: "right";
}

export interface ReportTable {
  slug: string;
  title: string;
  description: string;
  columns: ReportColumn[];
  rows: Record<string, string | number>[];
  summary: { label: string; value: string | number }[];
}

async function locationTotals() {
  const rows = await db
    .select({
      label: locations.name,
      building: locations.building,
      count: count(),
      value: sql<string>`coalesce(sum(${assets.purchasePrice}), 0)::numeric(14,2)`,
    })
    .from(assets)
    .innerJoin(locations, eq(assets.locationId, locations.id))
    .groupBy(locations.name, locations.building)
    .orderBy(desc(count()));

  return rows.map((row) => ({ ...row, value: Number(row.value) }));
}

async function departmentTotals() {
  const rows = await db
    .select({
      label: departments.name,
      manager: departments.manager,
      count: count(),
      value: sql<string>`coalesce(sum(${assets.purchasePrice}), 0)::numeric(14,2)`,
    })
    .from(assets)
    .innerJoin(departments, eq(assets.departmentId, departments.id))
    .groupBy(departments.name, departments.manager)
    .orderBy(desc(count()));

  return rows.map((row) => ({ ...row, value: Number(row.value) }));
}

export async function buildReport(slug: string): Promise<ReportTable | null> {
  const settings = await getSettings();
  const money = (value: number) => formatCurrency(value, settings.currency);
  const day = (value: string) => formatDate(value, settings.dateFormat);

  switch (slug) {
    case "register": {
      const rows = await listAssets();
      const totalValue = rows.reduce((sum, asset) => sum + (asset.purchasePrice ?? 0), 0);

      return {
        slug,
        title: "Asset Register",
        description: "Complete list of ICT assets and current status.",
        columns: [
          { key: "code", label: "Code" },
          { key: "asset", label: "Asset" },
          { key: "category", label: "Category" },
          { key: "location", label: "Location" },
          { key: "status", label: "Status" },
          { key: "condition", label: "Condition" },
          { key: "price", label: "Value", align: "right" },
        ],
        rows: rows.map((asset) => ({
          code: asset.code,
          asset: [asset.brand, asset.model].filter(Boolean).join(" ") || "—",
          category: asset.category,
          location: asset.location || "—",
          status: asset.status,
          condition: asset.condition,
          price: money(asset.purchasePrice ?? 0),
        })),
        summary: [
          { label: "Total assets", value: rows.length },
          { label: "Total value", value: money(totalValue) },
        ],
      };
    }

    case "valuation": {
      const rows = await db
        .select({
          label: assets.category,
          count: count(),
          value: sql<string>`coalesce(sum(${assets.purchasePrice}), 0)::numeric(14,2)`,
        })
        .from(assets)
        .groupBy(assets.category)
        .orderBy(desc(count()));

      const stats = rows.map((row) => ({ ...row, value: Number(row.value) }));
      const totalValue = stats.reduce((sum, row) => sum + row.value, 0);

      return {
        slug,
        title: "Asset Valuation",
        description: "Purchase value and inventory valuation by category.",
        columns: [
          { key: "category", label: "Category" },
          { key: "count", label: "Assets", align: "right" },
          { key: "value", label: "Value", align: "right" },
          { key: "share", label: "Share", align: "right" },
        ],
        rows: stats.map((row) => ({
          category: row.label,
          count: row.count,
          value: money(row.value),
          share: totalValue === 0 ? "0%" : `${Math.round((row.value / totalValue) * 100)}%`,
        })),
        summary: [
          { label: "Total value", value: money(totalValue) },
        ],
      };
    }

    case "maintenance": {
      const rows = await listMaintenance();
      const totalCost = rows.reduce((sum, row) => sum + row.cost, 0);

      return {
        slug,
        title: "Maintenance",
        description: "Maintenance history, status and repair costs.",
        columns: [
          { key: "code", label: "Asset" },
          { key: "problem", label: "Problem" },
          { key: "technician", label: "Technician" },
          { key: "status", label: "Status" },
          { key: "date", label: "Reported" },
          { key: "cost", label: "Cost", align: "right" },
        ],
        rows: rows.map((row) => ({
          code: row.code,
          problem: row.problem,
          technician: row.technician || "—",
          status: row.status,
          date: day(row.date),
          cost: money(row.cost),
        })),
        summary: [
          { label: "Records", value: rows.length },
          { label: "Total cost", value: money(totalCost) },
        ],
      };
    }

    case "broken": {
      const rows = await listBroken();

      return {
        slug,
        title: "Broken Assets",
        description: "Damaged, broken and repair records.",
        columns: [
          { key: "asset", label: "Asset" },
          { key: "problem", label: "Problem" },
          { key: "location", label: "Location" },
          { key: "reported", label: "Reported" },
          { key: "status", label: "Status" },
          { key: "action", label: "Action" },
        ],
        rows: rows.map((row) => ({
          asset: row.asset,
          problem: row.problem,
          location: row.location || "—",
          reported: day(row.reportedDate),
          status: row.status,
          action: row.action || "—",
        })),
        summary: [{ label: "Broken items", value: rows.length }],
      };
    }

    case "location": {
      const rows = await locationTotals();
      const totalValue = rows.reduce((sum, row) => sum + row.value, 0);

      return {
        slug,
        title: "Location Report",
        description: "Assets grouped by location, with values.",
        columns: [
          { key: "location", label: "Location" },
          { key: "building", label: "Building" },
          { key: "count", label: "Assets", align: "right" },
          { key: "value", label: "Value", align: "right" },
        ],
        rows: rows.map((row) => ({
          location: row.label,
          building: row.building || "—",
          count: row.count,
          value: money(row.value),
        })),
        summary: [{ label: "Total value", value: money(totalValue) }],
      };
    }

    case "department": {
      const rows = await departmentTotals();
      const totalValue = rows.reduce((sum, row) => sum + row.value, 0);

      return {
        slug,
        title: "Department Report",
        description: "Assets assigned to each department, with values.",
        columns: [
          { key: "department", label: "Department" },
          { key: "manager", label: "Manager" },
          { key: "count", label: "Assets", align: "right" },
          { key: "value", label: "Value", align: "right" },
        ],
        rows: rows.map((row) => ({
          department: row.label,
          manager: row.manager || "—",
          count: row.count,
          value: money(row.value),
        })),
        summary: [{ label: "Total value", value: money(totalValue) }],
      };
    }

    default:
      return null;
  }
}
