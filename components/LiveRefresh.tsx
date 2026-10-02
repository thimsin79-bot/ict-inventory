"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import type { RealtimeTopic } from "@/lib/realtime/types";

/**
 * Subscribes to the SSE change feed and re-fetches the current route's server
 * components whenever a watched topic changes. Renders nothing.
 */
export function LiveRefresh({ topics }: { topics: readonly RealtimeTopic[] }) {
  const router = useRouter();
  const topicsKey = [...topics].sort().join(",");
  const pending = useRef(false);
  const onVisible = useRef<(() => void) | null>(null);

  useEffect(() => {
    const source = new EventSource(`/api/events?topics=${encodeURIComponent(topicsKey)}`);
    let timer: number | undefined;

    const scheduleRefresh = () => {
      if (pending.current) {
        return;
      }
      pending.current = true;
      timer = window.setTimeout(() => {
        pending.current = false;
        router.refresh();
      }, 300);
    };

    const handleChange = () => {
      if (document.hidden) {
        // Defer until the tab is visible again so background tabs stay idle.
        if (!onVisible.current) {
          onVisible.current = () => {
            onVisible.current = null;
            scheduleRefresh();
          };
          document.addEventListener("visibilitychange", onVisible.current, { once: true });
        }
        return;
      }
      scheduleRefresh();
    };

    source.addEventListener("change", handleChange);

    return () => {
      source.removeEventListener("change", handleChange);
      source.close();
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
      if (onVisible.current) {
        document.removeEventListener("visibilitychange", onVisible.current);
        onVisible.current = null;
      }
      pending.current = false;
    };
  }, [router, topicsKey]);

  return null;
}
