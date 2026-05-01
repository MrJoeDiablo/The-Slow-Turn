import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/PageHeader";
import { useAgents } from "@/hooks/useAgents";
import { cn } from "@/lib/utils";

export default function Logs() {
  const { data: agents = [] } = useAgents();
  const [logs, setLogs] = useState<any[]>([]);
  const [level, setLevel] = useState<string>("all");

  useEffect(() => {
    (async () => {
      let q = supabase.from("agent_logs").select("*").order("created_at", { ascending: false }).limit(200);
      if (level !== "all") q = q.eq("level", level as any);
      const { data } = await q;
      setLogs(data ?? []);
    })();
  }, [level]);

  const name = (id: string | null) => agents.find((a) => a.id === id)?.name ?? "system";

  return (
    <div className="container py-6 sm:py-10 animate-fade-up">
      <PageHeader eyebrow="Telemetry" title="Logs" subtitle="Unified activity timeline." />
      <div className="flex gap-2 mb-4">
        {["all", "info", "warn", "error"].map((l) => (
          <button key={l} onClick={() => setLevel(l)}
            className={cn("font-mono text-[10px] uppercase tracking-wider px-3 py-1 rounded border",
              level === l ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground")}>
            {l}
          </button>
        ))}
      </div>
      <div className="panel p-4 font-mono text-xs">
        {logs.length === 0 ? <p className="text-muted-foreground text-center py-8">No logs.</p> : (
          <ul className="space-y-2">
            {logs.map((l) => (
              <li key={l.id} className="grid grid-cols-[auto_auto_1fr] gap-3 border-b border-border/50 pb-2">
                <span className="text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
                <span className={l.level === "error" ? "text-destructive" : l.level === "warn" ? "text-warning" : "text-info"}>[{l.level}]</span>
                <span><span className="text-primary">{name(l.agent_id)}:</span> {l.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}