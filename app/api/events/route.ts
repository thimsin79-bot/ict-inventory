import { getCurrentUser } from "@/lib/auth/session";
import {
  REALTIME_TOPICS,
  subscribe,
  type RealtimeEvent,
  type RealtimeTopic,
} from "@/lib/realtime/bus";

export const dynamic = "force-dynamic";

const HEARTBEAT_MS = 20_000;

export async function GET(request: Request): Promise<Response> {
  const user = await getCurrentUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const requested = (url.searchParams.get("topics") ?? "")
    .split(",")
    .map((topic) => topic.trim())
    .filter((topic): topic is RealtimeTopic =>
      (REALTIME_TOPICS as readonly string[]).includes(topic),
    );
  const subscribed = new Set<RealtimeTopic>(requested.length > 0 ? requested : REALTIME_TOPICS);

  const encoder = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      let unsubscribe: (() => void) | null = null;

      const send = (chunk: string) => {
        if (closed) {
          return;
        }
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          closed = true;
        }
      };

      const onChange = (event: RealtimeEvent) => {
        if (subscribed.has(event.topic)) {
          send(`event: change\ndata: ${JSON.stringify(event)}\n\n`);
        }
      };

      const heartbeat = setInterval(() => send(`: ping ${Date.now()}\n\n`), HEARTBEAT_MS);

      cleanup = () => {
        if (closed) {
          return;
        }
        closed = true;
        clearInterval(heartbeat);
        unsubscribe?.();
        try {
          controller.close();
        } catch {
          // already closed by the client
        }
      };

      // Announce readiness before wiring up the backend so a slow/unreachable
      // Redis never delays the client's first byte.
      send("retry: 3000\n\n");
      send(`event: ready\ndata: ${JSON.stringify({ topics: [...subscribed] })}\n\n`);
      request.signal.addEventListener("abort", cleanup);

      unsubscribe = await subscribe(onChange);

      // The stream may have been aborted while we were waiting.
      if (closed) {
        unsubscribe();
      }
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}
