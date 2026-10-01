import Link from "next/link";

import { AssetRegister } from "@/components/AssetRegister";
import { PageHeader } from "@/components/PageHeader";
import { listAssets } from "@/lib/store";

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ q }, assets] = await Promise.all([searchParams, listAssets()]);
  const query = q ?? "";

  return (
    <>
      <PageHeader
        title="All Assets"
        subtitle="Manage the complete ICT asset register"
        action={
          <Link className="btn btn-primary" href="/assets/new">
            ＋ Add Asset
          </Link>
        }
      />
      <AssetRegister key={query} assets={assets} initialQuery={query} />
    </>
  );
}
