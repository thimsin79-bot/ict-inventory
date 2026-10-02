import Link from "next/link";

import { Badge } from "@/components/Badge";
import { EM_DASH } from "@/lib/format";
import type { Asset, Paginated } from "@/lib/types";

function queryString(
  params: Record<string, string | undefined>,
  exclude: readonly string[] = [],
): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && !exclude.includes(key)) {
      search.set(key, value);
    }
  }

  return search.toString();
}

function SortHeader({
  label,
  sortKey,
  current,
  direction,
  params,
  align,
}: {
  label: string;
  sortKey: string;
  current: string;
  direction: string;
  params: Record<string, string | undefined>;
  align?: "right";
}) {
  const active = current === sortKey;
  const next = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && key !== "page" && key !== "sort" && key !== "dir") {
      next.set(key, value);
    }
  }

  next.set("sort", sortKey);
  next.set("dir", active && direction === "asc" ? "desc" : "asc");

  return (
    <th scope="col" className={align === "right" ? "num" : undefined}>
      <Link className="sortlink" href={`/assets?${next.toString()}`}>
        {label}
        <span aria-hidden="true">{active ? (direction === "asc" ? " ▲" : " ▼") : ""}</span>
      </Link>
    </th>
  );
}

function pageHref(
  params: Record<string, string | undefined>,
  sort: string,
  dir: string,
  page: number,
): string {
  const next = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && key !== "page") {
      next.set(key, value);
    }
  }

  next.set("page", String(page));
  next.set("sort", sort);
  next.set("dir", dir);

  return `/assets?${next.toString()}`;
}

export function AssetRegister({
  result,
  facets,
  filters,
  params,
  sort,
  direction,
  pageSize,
  canEdit,
}: {
  result: Paginated<Asset>;
  facets: {
    categories: string[];
    statuses: string[];
    locations: { id: number; name: string }[];
    departments: { id: number; name: string }[];
  };
  filters: {
    q?: string;
    category?: string;
    status?: string;
    locationId?: number;
    departmentId?: number;
  };
  params: Record<string, string | undefined>;
  sort: string;
  direction: string;
  pageSize: number;
  canEdit: boolean;
}) {
  const { rows, total, page, pageCount } = result;
  const filtered = rows.length < total || Boolean(filters.q);

  const resetHref = `/assets${sort === "code" && direction === "asc" ? "" : `?sort=${sort}&dir=${direction}`}`;

  return (
    <>
      <form className="toolbar" action="/assets" method="get">
        <input
          type="search"
          name="q"
          defaultValue={filters.q ?? ""}
          placeholder="Search code, serial, brand..."
          aria-label="Search assets"
        />

        <select name="category" defaultValue={filters.category ?? ""} aria-label="Filter by category">
          <option value="">All Categories</option>
          {facets.categories.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select name="status" defaultValue={filters.status ?? ""} aria-label="Filter by status">
          <option value="">All Status</option>
          {facets.statuses.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          name="locationId"
          defaultValue={filters.locationId ?? ""}
          aria-label="Filter by location"
        >
          <option value="">All Locations</option>
          {facets.locations.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>

        <select
          name="departmentId"
          defaultValue={filters.departmentId ?? ""}
          aria-label="Filter by department"
        >
          <option value="">All Departments</option>
          {facets.departments.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>

        <select name="pageSize" defaultValue={String(pageSize)} aria-label="Rows per page">
          {[10, 25, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>

        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="dir" value={direction} />

        <button className="btn btn-primary" type="submit">
          Apply
        </button>
        <Link className="btn btn-light" href={resetHref}>
          Reset
        </Link>
        <Link
          className="btn btn-light"
          href={`/api/assets/export?${queryString(params, ["page"])}`}
        >
          Export CSV
        </Link>
      </form>

      <div className="panel">
        <div className="panel-head">
          <h2>
            {total.toLocaleString()} {total === 1 ? "asset" : "assets"}
            {filtered ? " match your filters" : ""}
          </h2>
        </div>

        {rows.length === 0 ? (
          <p className="empty">
            {filtered
              ? "No assets match your search."
              : "No assets registered yet. Add your first asset to get started."}
          </p>
        ) : (
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <SortHeader
                    label="Asset Code"
                    sortKey="code"
                    current={sort}
                    direction={direction}
                    params={params}
                  />
                  <SortHeader
                    label="Category"
                    sortKey="category"
                    current={sort}
                    direction={direction}
                    params={params}
                  />
                  <th scope="col">Brand / Model</th>
                  <th scope="col">Serial Number</th>
                  <SortHeader
                    label="Location"
                    sortKey="location"
                    current={sort}
                    direction={direction}
                    params={params}
                  />
                  <SortHeader
                    label="Department"
                    sortKey="department"
                    current={sort}
                    direction={direction}
                    params={params}
                  />
                  <SortHeader
                    label="Status"
                    sortKey="status"
                    current={sort}
                    direction={direction}
                    params={params}
                  />
                  <SortHeader
                    label="Value"
                    sortKey="purchasePrice"
                    current={sort}
                    direction={direction}
                    params={params}
                    align="right"
                  />
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((asset) => (
                  <tr key={asset.id}>
                    <td>
                      <Link className="link" href={`/assets/${asset.id}`}>
                        {asset.code}
                      </Link>
                    </td>
                    <td>{asset.category}</td>
                    <td>
                      {asset.brand} {asset.model}
                    </td>
                    <td className="mono">{asset.serial}</td>
                    <td>{asset.location || EM_DASH}</td>
                    <td>{asset.department || EM_DASH}</td>
                    <td>
                      <Badge status={asset.status} />
                    </td>
                    <td className="num">{asset.purchasePrice ?? EM_DASH}</td>
                    <td className="rowactions">
                      <Link className="btn btn-light" href={`/assets/${asset.id}`}>
                        View
                      </Link>
                      {canEdit ? (
                        <Link className="btn btn-light" href={`/assets/${asset.id}/edit`}>
                          Edit
                        </Link>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pageCount > 1 ? (
        <nav className="pager" aria-label="Pagination">
          <Link
            className={`btn btn-light${page <= 1 ? " disabled" : ""}`}
            href={pageHref(params, sort, direction, Math.max(page - 1, 1))}
            aria-disabled={page <= 1}
          >
            ← Previous
          </Link>
          <span>
            Page {page} of {pageCount}
          </span>
          <Link
            className={`btn btn-light${page >= pageCount ? " disabled" : ""}`}
            href={pageHref(params, sort, direction, Math.min(page + 1, pageCount))}
            aria-disabled={page >= pageCount}
          >
            Next →
          </Link>
        </nav>
      ) : null}
    </>
  );
}
