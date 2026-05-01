import { GatewayHealth } from "./types";

// TODO: replace with live OpenClaw gateway calls via the openclaw-proxy edge function.
export async function mockHealthCheck(configured: boolean): Promise<GatewayHealth> {
  if (!configured) {
    return { ok: false, latency_ms: 0, status: "not_configured", checked_at: new Date().toISOString() };
  }
  // simulate variable latency
  const latency = 40 + Math.floor(Math.random() * 80);
  return { ok: true, latency_ms: latency, status: "online", checked_at: new Date().toISOString() };
}