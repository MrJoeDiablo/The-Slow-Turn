import { useEffect, useState } from "react";
import { openclaw } from "@/lib/openclaw/client";
import { GatewayHealth } from "@/lib/openclaw/types";

export function useGatewayHealth(intervalMs = 30000) {
  const [health, setHealth] = useState<GatewayHealth | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      const h = await openclaw.checkHealth();
      if (!cancelled) setHealth(h);
    }
    tick();
    const id = setInterval(tick, intervalMs);
    return () => { cancelled = true; clearInterval(id); };
  }, [intervalMs]);

  return health;
}