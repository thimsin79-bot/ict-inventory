import Link from "next/link";

import { AddAssetForm } from "@/components/AddAssetForm";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { getAssetFormOptions, getNextAssetCode } from "@/lib/store";

export default async function AddAssetPage() {
  const [assetCode, options] = await Promise.all([
    getNextAssetCode(),
    getAssetFormOptions(),
  ]);

  return (
    <>
      <PageHeader
        title="Add New Asset"
        subtitle="Register a new ICT asset"
        action={
          <Link className="btn btn-light" href="/assets">
            ← Back
          </Link>
        }
      />
      <Panel>
        <AddAssetForm assetCode={assetCode} options={options} />
      </Panel>
    </>
  );
}
