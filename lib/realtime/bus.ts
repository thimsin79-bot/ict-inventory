import { localBackend } from "./local";
import { redisBackend, redisConfigured } from "./redis";
import {
  REALTIME_TOPICS,
  type RealtimeBackend,
  type RealtimeEvent,
  type RealtimeHandler,
  type RealtimeTopic,
} from "./types";

export { REALTIME_TOPICS };
export type { RealtimeEvent, RealtimeHandler, RealtimeTopic };

/**
 * Backend selection happens once per process. With `REDIS_URL` set, changes
 * propagate across every instance via Redis pub/sub; without it, the bus is
 * in-process only.
 */
const globalForBackend = globalThis as unknown as { ictRealtimeBackend?: RealtimeBackend };

function selectBackend(): RealtimeBackend {
  if (!globalForBackend.ictRealtimeBackend) {
    const backend = redisConfigured() ? redisBackend : localBackend;
    globalForBackend.ictRealtimeBackend = backend;
    console.info(`[realtime] using ${backend.name} backend`);
  }
  return globalForBackend.ictRealtimeBackend;
}

export const backend: RealtimeBackend = selectBackend();

/** Fan a change out to subscribers on every instance. */
export function publish(event: Omit<RealtimeEvent, "at">): void {
  backend.publish({ at: Date.now(), ...event });
}

/** Register a handler; resolves with an unsubscribe function. */
export async function subscribe(handler: RealtimeHandler): Promise<() => void> {
  return backend.subscribe(handler);
}
