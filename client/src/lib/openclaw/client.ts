import { supabase } from "@/integrations/supabase/client";
import { mockHealthCheck } from "./mock";
import { GatewayHealth } from "./types";

const USE_MOCK = true; // TODO: flip when openclaw-proxy edge function is wired to live gateway

export const openclaw = {
  async getGatewaySettings() {
    const { data } = await supabase.from("openclaw_gateway_settings").select("*").maybeSingle();
    return data;
  },
  async checkHealth(): Promise<GatewayHealth> {
    const settings = await this.getGatewaySettings();
    if (USE_MOCK) return mockHealthCheck(!!settings?.gateway_url);
    // TODO: live call via supabase.functions.invoke("openclaw-proxy", { body: { action: "health" } })
    return mockHealthCheck(!!settings?.gateway_url);
  },
  async sendMessage(_agentId: string, _content: string) {
    // TODO: live call via openclaw-proxy
    return { ok: true, mock: true };
  },
};