import Link from "next/link";

import { AssetRegister } from "@/components/AssetRegister";
import { LiveRefresh } from "@/components/LiveRefresh";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/auth/guards";
import { canWrite } from "@/lib/permissions";
import { getAssetFacets, listAssetsPaginated } from "@/lib/store/assets";
import type { AssetFilters, AssetSortKey } from "@/lib/types";

const SORT_KEYS: readonly AssetSortKey[] = [
  "code",
  "category",
  "brand",
  "status",
  "location",
  "department",
  "purchaseDate",
  "purchasePrice",
];

function one(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === undefined || raw === "" ? undefined : raw;
}

function optionalId(value: string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [user, raw] = await Promise.all([requireUser(), searchParams]);

  const filters: AssetFilters = {
    q: one(raw.q),
    category: one(raw.category),
    status: one(raw.status),
    locationId: optionalId(one(raw.locationId)),
    departmentId: optionalId(one(raw.departmentId)),
    sort: SORT_KEYS.includes(one(raw.sort) as AssetSortKey)
      ? (one(raw.sort) as AssetSortKey)
      : "code",
    direction: one(raw.dir) === "desc" ? "desc" : "asc",
    page: optionalId(one(raw.page)) ?? 1,
    pageSize: optionalId(one(raw.pageSize)) ?? 25,
  };

  const [result, facets] = await Promise.all([
    listAssetsPaginated(filters),
    getAssetFacets(),
  ]);

  const params = Object.fromEntries(
    Object.entries(raw)
      .map(([key, value]) => [key, one(value)] as const)
      .filter(([, value]) => value !== undefined),
  );

  return (
    <>
      <LiveRefresh topics={["assets"]} />
      <PageHeader
        title="All Assets"
        subtitle="Manage the complete ICT asset register"
        action={
          canWrite(user.role) ? (
            <Link className="btn btn-primary" href="/assets/new">
              ＋ Add Asset
            </Link>
          ) : null
        }
      />
      <AssetRegister
        result={result}
        facets={facets}
        filters={{
          q: filters.q,
          category: filters.category,
          status: filters.status,
          locationId: filters.locationId,
          departmentId: filters.departmentId,
        }}
        params={params}
        sort={filters.sort ?? "code"}
        direction={filters.direction ?? "asc"}
        pageSize={filters.pageSize ?? 25}
        canEdit={canWrite(user.role)}
      />
    </>
  );
}
