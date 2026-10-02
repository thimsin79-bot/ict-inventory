import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/guards";
import { type CsvColumn, toCsv } from "@/lib/csv";
import { listAssets } from "@/lib/store/assets";
import type { Asset } from "@/lib/types";

const COLUMNS: readonly CsvColumn<Asset>[] = [
  { header: "Asset Code", value: (a) => a.code },
  { header: "Category", value: (a) => a.category },
  { header: "Brand", value: (a) => a.brand },
  { header: "Model", value: (a) => a.model },
  { header: "Serial Number", value: (a) => a.serial },
  { header: "Location", value: (a) => a.location },
  { header: "Department", value: (a) => a.department },
  { header: "Supplier", value: (a) => a.supplier },
  { header: "Status", value: (a) => a.status },
  { header: "Condition", value: (a) => a.condition },
  { header: "Availability", value: (a) => a.availability },
  { header: "Purchase Price", value: (a) => a.purchasePrice ?? "" },
  { header: "Purchase Date", value: (a) => a.purchaseDate ?? "" },
  { header: "Remarks", value: (a) => a.remarks },
];

export async function GET(request: Request): Promise<NextResponse> {
  await requireUser();

  const url = new URL(request.url);
  const param = (name: string): string | undefined =>
    url.searchParams.get(name) ?? undefined;
  const id = (name: string): number | undefined => {
    const raw = param(name);
    const parsed = Number(raw);
    return raw !== undefined && Number.isFinite(parsed) ? parsed : undefined;
  };

  const assets = await listAssets({
    q: param("q"),
    category: param("category"),
    status: param("status"),
    locationId: id("locationId"),
    departmentId: id("departmentId"),
  });

  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(toCsv(COLUMNS, assets), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="assets-${stamp}.csv"`,
      "cache-control": "no-store",
    },
  });
}
