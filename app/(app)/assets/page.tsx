import Link from "next/link";

import { AssetRegister } from "@/components/AssetRegister";
import { PageHeader } from "@/components/PageHeader";
import { ASSETS } from "@/lib/data";

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
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
      <AssetRegister key={query} assets={ASSETS} initialQuery={query} />
    </>
  );
}
