import { NextResponse } from "next/server";
import QRCode from "qrcode";

import { requireUser } from "@/lib/auth/guards";

export async function GET(request: Request): Promise<Response> {
  await requireUser();

  const url = new URL(request.url);
  const code = (url.searchParams.get("code") ?? "").trim().slice(0, 120);
  const requested = Number(url.searchParams.get("size") ?? "160");
  const size = Number.isFinite(requested) ? Math.min(512, Math.max(64, requested)) : 160;

  if (code === "") {
    return new NextResponse("Missing code", { status: 400 });
  }

  const png = await QRCode.toBuffer(code, {
    type: "png",
    width: size,
    margin: 1,
    errorCorrectionLevel: "M",
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=86400, immutable",
    },
  });
}
