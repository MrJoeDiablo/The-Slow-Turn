import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAgents } from "@/hooks/useAgents";
import { useGatewayHealth } from "@/hooks/useGatewayHealth";
import { AgentCard } from "@/components/agents/AgentCard";
import { PageHeader } from "@/components/app/PageHeader";
import { StatTile } from "@/components/app/StatTile";
import { EmptyState } from "@/components/app/EmptyState";
import { Activity, AlertTriangle } from "lucide-react";

interface Log { id: string; agent_id: string | null; level: string; message: string; created_at: string; }

export default function Dashboard() {
  const { data: agents = [] } = useAgents();
  const health = useGatewayHealth();
  const [logs, setLogs] = useState<Log[]>([]);
  const [activeTasks, setActiveTasks] = useState(0);
  const [openAlerts, setOpenAlerts] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: l } = await supabase.from("agent_logs").select("*").order("created_at", { ascending: false }).limit(20);
      setLogs(l ?? []);
      const { count: t } = await supabase.from("agent_tasks").select("*", { count: "exact", head: true }).in("status", ["pending", "in_progress"]);
      setActiveTasks(t ?? 0);
      const { count: a } = await supabase.from("agent_logs").select("*", { count: "exact", head: true }).eq("level", "error");
      setOpenAlerts(a ?? 0);
    })();

    const ch = supabase.channel("logs-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "agent_logs" }, (payload) => {
        setLogs((prev) => [payload.new as Log, ...prev].slice(0, 20));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const onlineCount = agents.filter((a) => a.status === "online" || a.status === "working").length;

  return (
    <div className="container py-6 sm:py-10 animate-fade-up">
      <PageHeader eyebrow="Mission control" title="Operating room" subtitle="Live status across the AI operating team." />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatTile label="Online agents" value={`${onlineCount} / ${agents.length}`} tone="primary" hint="Working or online" />
        <StatTile label="Active tasks" value={activeTasks} hint="Pending or in progress" />
        <StatTile label="Open alerts" value={openAlerts} tone={openAlerts > 0 ? "destructive" : "default"} hint="Errors logged" />
        <StatTile label="Gateway latency" value={health?.status === "online" ? `${health.latency_ms}ms` : "—"} tone={health?.status === "online" ? "primary" : "warning"} hint={`OpenClaw ${health?.status ?? "checking"}`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="eyebrow mb-3">Agents</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {agents.map((a) => <AgentCard key={a.id} agent={a as any} />)}
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="eyebrow mb-3 flex items-center gap-2"><Activity size={12} /> Activity feed</h2>
            <div className="panel p-4 max-h-[400px] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No activity yet. Agent logs will stream here.</p>
              ) : (
                <ul className="space-y-3">
                  {logs.map((l) => (
                    <li key={l.id} className="text-xs">
                      <p className="font-mono text-[10px] text-muted-foreground">{new Date(l.created_at).toLocaleTimeString()}</p>
                      <p className="text-foreground/90">{l.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section>
            <h2 className="eyebrow mb-3 flex items-center gap-2"><AlertTriangle size={12} /> Alerts</h2>
            {openAlerts === 0 ? (
              <EmptyState title="All clear" body="No gateway, API, billing, model, or deployment alerts." />
            ) : (
              <div className="panel p-4">
                <p className="text-sm text-destructive">{openAlerts} error log{openAlerts === 1 ? "" : "s"} — see Logs.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}