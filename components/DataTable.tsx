import type { ReactNode } from "react";

import { Badge } from "@/components/Badge";
import type { SimpleTable, TableCell } from "@/lib/types";

function renderCell(cell: TableCell): ReactNode {
  if (typeof cell === "string") {
    return cell;
  }
  return <Badge tone={cell.tone}>{cell.text}</Badge>;
}

export function DataTable({ table, action }: { table: SimpleTable; action?: string }) {
  return (
    <div className="tablewrap">
      <table>
        <thead>
          <tr>
            {table.columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
            {action ? (
              <th scope="col">{action}</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{renderCell(cell)}</td>
              ))}
              {action ? (
                <td>
                  <button className="btn btn-light" type="button">
                    View
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
