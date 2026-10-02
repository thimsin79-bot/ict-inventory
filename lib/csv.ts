/** Minimal RFC 4180 CSV writer, shared by every export in the app. */
export interface CsvColumn<T> {
  header: string;
  value: (row: T) => unknown;
}

function escape(value: unknown): string {
  const text =
    value === null || value === undefined
      ? ""
      : value instanceof Date
        ? value.toISOString()
        : String(value);

  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv<T>(columns: readonly CsvColumn<T>[], rows: readonly T[]): string {
  const lines = [
    columns.map((column) => escape(column.header)).join(","),
    ...rows.map((row) => columns.map((column) => escape(column.value(row))).join(",")),
  ];

  // The BOM makes Excel open UTF-8 files without mangling non-ASCII names.
  return `﻿${lines.join("\r\n")}\r\n`;
}
