/**
 * Client-safe realtime types. This module must not import any server-only
 * packages so it can be referenced from client components.
 */
export type RealtimeTopic =
  | "assets"
  | "assignments"
  | "transfers"
  | "maintenance"
  | "broken"
  | "audit";

export const REALTIME_TOPICS: readonly RealtimeTopic[] = [
  "assets",
  "assignments",
  "transfers",
  "maintenance",
  "broken",
  "audit",
];

export type RealtimeAction = "created" | "updated" | "deleted";

export interface RealtimeEvent {
  topic: RealtimeTopic;
  action: RealtimeAction;
  id?: number;
  at: number;
}

/** A subscriber registered against the realtime backend. */
export type RealtimeHandler = (event: RealtimeEvent) => void;

/**
 * The contract every backend (in-process, Redis, ...) implements. `publish`
 * fans a change out to all subscribers; `subscribe` registers a handler and
 * returns an unsubscribe function.
 */
export interface RealtimeBackend {
  readonly name: string;
  publish(event: RealtimeEvent): void;
  subscribe(handler: RealtimeHandler): Promise<() => void>;
}
