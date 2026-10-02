import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/guards";
import { toCsv, type CsvColumn } from "@/lib/csv";
import { buildReport } from "@/lib/store";

type ReportRow = Record<string, string | number>;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  await requireUser();

  const { slug } = await params;
  const report = await buildReport(slug);

  if (!report) {
    return new NextResponse("Report not found", { status: 404 });
  }

  const columns: readonly CsvColumn<ReportRow>[] = report.columns.map((column) => ({
    header: column.label,
    value: (row) => row[column.key] ?? "",
  }));

  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(toCsv(columns, report.rows), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${report.slug}-${stamp}.csv"`,
      "cache-control": "no-store",
    },
  });
}
