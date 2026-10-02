import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { assertCanWrite } from "@/lib/auth/actions";
import { publish } from "@/lib/realtime/bus";
import { deleteAsset } from "@/lib/store/assets";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await assertCanWrite();

  const { id: idStr } = await params;
  const id = Number(idStr);

  if (Number.isFinite(id)) {
    const state = await deleteAsset(id);
    if (state.status === "success") {
      publish({ topic: "assets", action: "deleted", id });
    }
  }

  revalidatePath("/assets");
  revalidatePath("/dashboard");
  redirect("/assets");
}
