import { createClient } from "redis";

import { emitLocal, onLocal } from "./local";
import type { RealtimeBackend, RealtimeEvent } from "./types";

/** Single channel; per-topic filtering happens on the receiving side. */
const CHANNEL = "ict:realtime:change";

/**
 * Connections are cached on `globalThis` so a hot reload or a second bundle
 * (Server Action + route handler) reuses the same clients instead of opening a
 * new pair on every import.
 */
const globalForRedis = globalThis as unknown as {
  ictRedisPublisher?: RedisClient;
  ictRedisPublisherReady?: Promise<RedisClient>;
  ictRedisSubscriber?: RedisClient;
  ictRedisBridge?: Promise<void>;
};

export function redisUrl(): string | null {
  const value = process.env.REDIS_URL?.trim();
  return value ? value : null;
}

export function redisConfigured(): boolean {
  return redisUrl() !== null;
}

function logError(role: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[realtime] Redis ${role} error: ${message}`);
}

function create(role: "publisher" | "subscriber") {
  const client = createClient({ url: redisUrl() ?? undefined });
  client.on("error", (error) => logError(role, error));
  return client;
}

type RedisClient = ReturnType<typeof create>;

function publisher(): Promise<RedisClient> {
  if (globalForRedis.ictRedisPublisherReady) {
    return globalForRedis.ictRedisPublisherReady;
  }

  const client = globalForRedis.ictRedisPublisher ?? create("publisher");
  globalForRedis.ictRedisPublisher = client;

  const ready = (client.isOpen ? Promise.resolve() : client.connect())
    .then(() => client)
    .catch((error) => {
      globalForRedis.ictRedisPublisherReady = undefined;
      throw error;
    });

  globalForRedis.ictRedisPublisherReady = ready;
  return ready;
}

/**
 * Connects the subscriber once and forwards every message into the local
 * emitter, so a message published on any instance reaches the SSE clients of
 * every instance (including this one).
 */
function bridge(): Promise<void> {
  if (globalForRedis.ictRedisBridge) {
    return globalForRedis.ictRedisBridge;
  }

  const client = globalForRedis.ictRedisSubscriber ?? create("subscriber");
  globalForRedis.ictRedisSubscriber = client;

  const ready = (async () => {
    if (!client.isOpen) {
      await client.connect();
    }
    await client.subscribe(CHANNEL, (message) => {
      try {
        emitLocal(JSON.parse(message) as RealtimeEvent);
      } catch (error) {
        logError("subscriber", error);
      }
    });
  })().catch((error) => {
    globalForRedis.ictRedisBridge = undefined;
    throw error;
  });

  globalForRedis.ictRedisBridge = ready;
  return ready;
}

export const redisBackend: RealtimeBackend = {
  name: "redis",
  publish(event) {
    const payload = JSON.stringify(event);
    publisher()
      .then((client) => client.publish(CHANNEL, payload))
      .catch((error) => {
        logError("publisher", error);
        // Redis is unreachable: keep this instance live on its own.
        emitLocal(event);
      });
  },
  async subscribe(handler) {
    const unsubscribe = onLocal(handler);
    try {
      await bridge();
    } catch (error) {
      // Degrade to single-instance updates rather than breaking the stream.
      logError("subscriber", error);
    }
    return unsubscribe;
  },
};
