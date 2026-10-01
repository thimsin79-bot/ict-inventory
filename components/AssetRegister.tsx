"use client";

import { useState } from "react";

import { Badge } from "@/components/Badge";
import type { Asset } from "@/lib/types";

const CATEGORY_OPTIONS = ["All Categories", "Desktop", "Laptop", "Printer", "Monitor"];

const STATUS_OPTIONS = ["All Status", "Active", "Assigned", "Maintenance", "Broken"];

function searchableText(asset: Asset) {
  return [
    asset.code,
    asset.category,
    asset.brandModel,
    asset.serial,
    asset.location,
    asset.department,
    asset.status,
  ]
    .join(" ")
    .toLowerCase();
}

export function AssetRegister({
  assets,
  initialQuery,
}: {
  assets: Asset[];
  initialQuery: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [message, setMessage] = useState("");

  const needle = query.trim().toLowerCase();
  const visible = assets.filter((asset) => {
    const matchesQuery = needle === "" || searchableText(asset).includes(needle);
    const matchesCategory = category === CATEGORY_OPTIONS[0] || asset.category === category;
    const matchesStatus = status === STATUS_OPTIONS[0] || asset.status === status;
    return matchesQuery && matchesCategory && matchesStatus;
  });

  return (
    <>
      <div className="toolbar">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search asset..."
          aria-label="Search assets"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filter by category"
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <button
          className="btn btn-light"
          type="button"
          onClick={() => setMessage("Demo UI: register would be exported as an Excel file.")}
        >
          Export Excel
        </button>
        <button
          className="btn btn-light"
          type="button"
          onClick={() => {
            setQuery("");
            setCategory(CATEGORY_OPTIONS[0]);
            setStatus(STATUS_OPTIONS[0]);
            setMessage("");
          }}
        >
          Reset
        </button>
      </div>
      {message ? (
        <p className="notice" role="status">
          {message}
        </p>
      ) : null}
      <div className="panel">
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                {[
                  "Asset Code",
                  "Category",
                  "Brand / Model",
                  "Serial Number",
                  "Location",
                  "Department",
                  "Status",
                  "Action",
                ].map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={8}>No assets match your search.</td>
                </tr>
              ) : (
                visible.map((asset) => (
                  <tr key={asset.code}>
                    <td>{asset.code}</td>
                    <td>{asset.category}</td>
                    <td>{asset.brandModel}</td>
                    <td>{asset.serial}</td>
                    <td>{asset.location}</td>
                    <td>{asset.department}</td>
                    <td>
                      <Badge tone={asset.tone}>{asset.status}</Badge>
                    </td>
                    <td>
                      <button className="btn btn-light" type="button">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
