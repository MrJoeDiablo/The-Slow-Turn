export type AgentStatus = "online" | "idle" | "working" | "error" | "offline";

export interface OpenClawAgent {
  id: string;
  name: string;
  role_title: string;
  status: AgentStatus;
  current_task?: string | null;
  model?: string | null;
  provider?: string | null;
}

export interface GatewayHealth {
  ok: boolean;
  latency_ms: number;
  status: "online" | "degraded" | "offline" | "not_configured";
  checked_at: string;
}