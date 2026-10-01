import Link from "next/link";

import { AddAssetForm } from "@/components/AddAssetForm";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { getNextAssetCode } from "@/lib/store";

export default async function AddAssetPage() {
  const assetCode = await getNextAssetCode();

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
        <AddAssetForm assetCode={assetCode} />
      </Panel>
    </>
  );
}
