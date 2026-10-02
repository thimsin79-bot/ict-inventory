import Link from "next/link";
import { redirect } from "next/navigation";

import { AssetForm } from "@/components/AssetForm";
import { PageHeader } from "@/components/PageHeader";
import { requireWrite } from "@/lib/auth/guards";
import { getAssetFormOptions, getNextAssetCode } from "@/lib/store/assets";

import { createAssetAction } from "../actions";

export default async function NewAssetPage() {
  await requireWrite("/assets/new");

  const [options, nextCode] = await Promise.all([
    getAssetFormOptions(),
    getNextAssetCode(),
  ]);

  // nextCode is always a number, so a blank code can only mean an empty register.
  if (!nextCode) {
    redirect("/locations");
  }

  return (
    <>
      <PageHeader
        title="Add Asset"
        subtitle="Register a new item in the asset register"
        action={
          <Link className="btn btn-light" href="/assets">
            ← Back to Assets
          </Link>
        }
      />
      <div className="panel">
        <div className="panel-head">
          <h2>Asset Details</h2>
        </div>
        <div className="panel-body">
          <AssetForm
            action={createAssetAction}
            options={options}
            values={{
              code: nextCode,
              category: "",
              brand: "",
              model: "",
              serial: "",
              locationId: null,
              departmentId: null,
              supplierId: null,
              status: "Active",
              condition: "Good",
              availability: "Available",
              purchasePrice: null,
              purchaseDate: null,
              remarks: "",
            }}
            submitLabel="Register Asset"
          />
        </div>
      </div>
    </>
  );
}
