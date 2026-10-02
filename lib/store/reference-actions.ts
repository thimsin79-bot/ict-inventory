"use server";

import { revalidatePath } from "next/cache";

import { assertAdministrator, assertCanWrite } from "@/lib/auth/actions";
import {
  deleteDepartment,
  deleteHistory,
  deleteLocation,
  deletePurchase,
  deleteSupplier,
  deleteUser,
  insertDepartment,
  insertHistory,
  insertLocation,
  insertPurchase,
  insertSupplier,
  insertUser,
  updateDepartment,
  updateLocation,
  updateSupplier,
  updateUser,
} from "@/lib/store/reference";
import { updateSettings } from "@/lib/store/settings";
import type {
  FormState,
  SettingsRecord,
  UserRole,
  UserStatus,
} from "@/lib/types";

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function number(formData: FormData, name: string): number | null {
  const raw = text(formData, name);
  if (raw === "") {
    return null;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function revalidate(...paths: string[]): void {
  for (const path of paths) {
    revalidatePath(path);
  }
  revalidatePath("/dashboard");
}

/* -------------------------------------------------------------- locations --- */

export async function createLocationAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertCanWrite();
  const state = await insertLocation({
    name: text(formData, "name"),
    building: text(formData, "building"),
    room: text(formData, "room"),
  });
  if (state.status === "success") {
    revalidate("/locations");
  }
  return state;
}

export async function updateLocationAction(
  id: number,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertCanWrite();
  const state = await updateLocation(id, {
    name: text(formData, "name"),
    building: text(formData, "building"),
    room: text(formData, "room"),
  });
  if (state.status === "success") {
    revalidate("/locations", `/locations/${id}/edit`);
  }
  return state;
}

export async function deleteLocationAction(formData: FormData): Promise<void> {
  await assertCanWrite();
  await deleteLocation(Number(formData.get("id") ?? 0));
  revalidate("/locations");
}

/* ------------------------------------------------------------ departments --- */

export async function createDepartmentAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertCanWrite();
  const state = await insertDepartment({
    name: text(formData, "name"),
    manager: text(formData, "manager"),
  });
  if (state.status === "success") {
    revalidate("/departments");
  }
  return state;
}

export async function updateDepartmentAction(
  id: number,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertCanWrite();
  const state = await updateDepartment(id, {
    name: text(formData, "name"),
    manager: text(formData, "manager"),
  });
  if (state.status === "success") {
    revalidate("/departments", `/departments/${id}/edit`);
  }
  return state;
}

export async function deleteDepartmentAction(formData: FormData): Promise<void> {
  await assertCanWrite();
  await deleteDepartment(Number(formData.get("id") ?? 0));
  revalidate("/departments");
}

/* -------------------------------------------------------------- suppliers --- */

export async function createSupplierAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertCanWrite();
  const state = await insertSupplier({
    name: text(formData, "name"),
    contact: text(formData, "contact"),
    phone: text(formData, "phone"),
    email: text(formData, "email"),
  });
  if (state.status === "success") {
    revalidate("/suppliers");
  }
  return state;
}

export async function updateSupplierAction(
  id: number,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertCanWrite();
  const state = await updateSupplier(id, {
    name: text(formData, "name"),
    contact: text(formData, "contact"),
    phone: text(formData, "phone"),
    email: text(formData, "email"),
  });
  if (state.status === "success") {
    revalidate("/suppliers", `/suppliers/${id}/edit`);
  }
  return state;
}

export async function deleteSupplierAction(formData: FormData): Promise<void> {
  await assertCanWrite();
  await deleteSupplier(Number(formData.get("id") ?? 0));
  revalidate("/suppliers");
}

/* -------------------------------------------------------------- purchases --- */

export async function createPurchaseAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertCanWrite();

  const descriptions = formData.getAll("itemDescription").map(String);
  const quantities = formData.getAll("itemQuantity").map(String);
  const prices = formData.getAll("itemUnitPrice").map(String);

  const items = descriptions
    .map((description, index) => ({
      description,
      quantity: Number(quantities[index] ?? "1") || 1,
      unitPrice: Number(prices[index] ?? "0") || 0,
    }))
    .filter((item) => item.description.trim() !== "");

  const state = await insertPurchase({
    invoice: text(formData, "invoice"),
    purchaseDate: text(formData, "purchaseDate"),
    supplierId: number(formData, "supplierId"),
    total: number(formData, "total") ?? 0,
    notes: text(formData, "notes"),
    items,
  });

  if (state.status === "success") {
    revalidate("/purchases");
  }

  return state;
}

export async function deletePurchaseAction(formData: FormData): Promise<void> {
  await assertCanWrite();
  await deletePurchase(Number(formData.get("id") ?? 0));
  revalidate("/purchases");
}

/* ---------------------------------------------------------------- history --- */

export async function createHistoryAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertCanWrite();
  const state = await insertHistory({
    year: number(formData, "year") ?? 0,
    item: text(formData, "item"),
    category: text(formData, "category"),
    supplier: text(formData, "supplier"),
    value: number(formData, "value"),
    remarks: text(formData, "remarks"),
  });
  if (state.status === "success") {
    revalidate("/history");
  }
  return state;
}

export async function deleteHistoryAction(formData: FormData): Promise<void> {
  await assertCanWrite();
  await deleteHistory(Number(formData.get("id") ?? 0));
  revalidate("/history");
}

/* ------------------------------------------------------------------ users --- */

export async function createUserAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertAdministrator();
  const state = await insertUser({
    name: text(formData, "name"),
    email: text(formData, "email"),
    password: String(formData.get("password") ?? ""),
    role: (text(formData, "role") || "Viewer") as UserRole,
    departmentId: number(formData, "departmentId"),
    status: (text(formData, "status") || "Active") as UserStatus,
  });
  if (state.status === "success") {
    revalidate("/users");
  }
  return state;
}

export async function updateUserAction(
  id: number,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const current = await assertAdministrator();
  const state = await updateUser(
    id,
    {
      name: text(formData, "name"),
      email: text(formData, "email"),
      password: String(formData.get("password") ?? ""),
      role: (text(formData, "role") || "Viewer") as UserRole,
      departmentId: number(formData, "departmentId"),
      status: (text(formData, "status") || "Active") as UserStatus,
    },
    current.id,
  );
  if (state.status === "success") {
    revalidate("/users", `/users/${id}/edit`);
  }
  return state;
}

export async function deleteUserAction(formData: FormData): Promise<void> {
  const current = await assertAdministrator();
  await deleteUser(Number(formData.get("id") ?? 0), current.id);
  revalidate("/users");
}

/* --------------------------------------------------------------- settings --- */

export async function updateSettingsAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertAdministrator();
  const state = await updateSettings({
    organizationName: text(formData, "organizationName"),
    assetCodePrefix: text(formData, "assetCodePrefix"),
    currency: text(formData, "currency") || "USD",
    dateFormat: text(formData, "dateFormat") || "dd-mmm-yyyy",
  } satisfies SettingsRecord);
  if (state.status === "success") {
    revalidate("/settings");
  }
  return state;
}
