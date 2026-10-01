"use client";

import { useState } from "react";

import { Badge } from "@/components/Badge";
import type { Asset } from "@/lib/types";

const ALL = "All";

function unique(values: string[]) {
  return [...new Set(values)].sort();
}

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
  const [category, setCategory] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [message, setMessage] = useState("");

  const categories = unique(assets.map((asset) => asset.category));
  const statuses = unique(assets.map((asset) => asset.status));

  const needle = query.trim().toLowerCase();
  const visible = assets.filter((asset) => {
    const matchesQuery = needle === "" || searchableText(asset).includes(needle);
    const matchesCategory = category === ALL || asset.category === category;
    const matchesStatus = status === ALL || asset.status === status;
    return matchesQuery && matchesCategory && matchesStatus;
  });

  const hasAssets = assets.length > 0;

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
          <option value={ALL}>All Categories</option>
          {categories.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter by status"
        >
          <option value={ALL}>All Status</option>
          {statuses.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          className="btn btn-light"
          type="button"
          onClick={() => setMessage("Export is not available until a data source is connected.")}
        >
          Export Excel
        </button>
        <button
          className="btn btn-light"
          type="button"
          onClick={() => {
            setQuery("");
            setCategory(ALL);
            setStatus(ALL);
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
        {visible.length === 0 ? (
          <p className="empty">
            {hasAssets
              ? "No assets match your search."
              : "No assets registered yet. Add your first asset to get started."}
          </p>
        ) : (
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
                {visible.map((asset) => (
                  <tr key={asset.code}>
                    <td>{asset.code}</td>
                    <td>{asset.category}</td>
                    <td>{asset.brandModel}</td>
                    <td>{asset.serial}</td>
                    <td>{asset.location}</td>
                    <td>{asset.department}</td>
                    <td>
                      <Badge status={asset.status} />
                    </td>
                    <td>
                      <button className="btn btn-light" type="button">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
