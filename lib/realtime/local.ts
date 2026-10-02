import { EventEmitter } from "node:events";

import type { RealtimeBackend, RealtimeEvent, RealtimeHandler } from "./types";

const CHANNEL = "change";

/**
 * Per-instance fan-out. Every SSE client on this process listens here. The
 * local backend is always present: the Redis backend publishes across
 * instances but still delivers into this emitter on the receiving side.
 *
 * Stored on `globalThis` so hot reloads and separate route/server-action
 * bundles share a single instance.
 */
const globalForLocal = globalThis as unknown as { ictRealtimeEmitter?: EventEmitter };

function emitter(): EventEmitter {
  if (!globalForLocal.ictRealtimeEmitter) {
    const created = new EventEmitter();
    created.setMaxListeners(0);
    globalForLocal.ictRealtimeEmitter = created;
  }
  return globalForLocal.ictRealtimeEmitter;
}

export function emitLocal(event: RealtimeEvent): void {
  emitter().emit(CHANNEL, event);
}

export function onLocal(handler: RealtimeHandler): () => void {
  const target = emitter();
  target.on(CHANNEL, handler);
  return () => target.off(CHANNEL, handler);
}

export const localBackend: RealtimeBackend = {
  name: "local",
  publish(event) {
    emitLocal(event);
  },
  async subscribe(handler) {
    return onLocal(handler);
  },
};
