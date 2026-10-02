"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { assertCanWrite } from "@/lib/auth/actions";
import { publish } from "@/lib/realtime/bus";
import {
  deleteAsset as deleteAssetRecord,
  insertAsset as insertAssetRecord,
  updateAsset as updateAssetRecord,
  type AssetInput,
} from "@/lib/store/assets";
import type { FormState } from "@/lib/types";

/** Turns the browser's string form values into the store's typed input. */
function readAssetInput(formData: FormData): AssetInput {
  const text = (name: string): string => String(formData.get(name) ?? "").trim();
  const number = (name: string): number | null => {
    const raw = text(name);
    if (raw === "") {
      return null;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  };

  return {
    code: text("code"),
    category: text("category"),
    brand: text("brand"),
    model: text("model"),
    serial: text("serial"),
    locationId: number("locationId"),
    departmentId: number("departmentId"),
    supplierId: number("supplierId"),
    status: text("status") as AssetInput["status"],
    condition: text("condition") as AssetInput["condition"],
    availability: text("availability") as AssetInput["availability"],
    purchasePrice: number("purchasePrice"),
    purchaseDate: text("purchaseDate") === "" ? null : text("purchaseDate"),
    remarks: String(formData.get("remarks") ?? ""),
  };
}

export async function createAssetAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertCanWrite();

  const state = await insertAssetRecord(readAssetInput(formData));

  if (state.status === "success") {
    revalidatePath("/assets");
    revalidatePath("/dashboard");
    publish({ topic: "assets", action: "created" });
  }

  return state;
}

export async function updateAssetAction(
  id: number,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertCanWrite();

  const state = await updateAssetRecord(id, readAssetInput(formData));

  if (state.status === "success") {
    revalidatePath("/assets");
    revalidatePath(`/assets/${id}`);
    revalidatePath("/dashboard");
    publish({ topic: "assets", action: "updated", id });
  }

  return state;
}

export async function deleteAssetAction(formData: FormData): Promise<void> {
  await assertCanWrite();

  const id = Number(formData.get("id"));

  if (Number.isFinite(id)) {
    const state = await deleteAssetRecord(id);
    if (state.status === "success") {
      publish({ topic: "assets", action: "deleted", id });
    }
  }

  revalidatePath("/assets");
  revalidatePath("/dashboard");
  redirect("/assets");
}
