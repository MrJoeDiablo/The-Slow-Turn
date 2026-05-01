import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/PageHeader";
import { useAgents } from "@/hooks/useAgents";
import { cn } from "@/lib/utils";

const COLS = ["pending", "in_progress", "blocked", "done"] as const;

export default function Tasks() {
  const { data: agents = [] } = useAgents();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("agent_tasks").select("*").order("created_at", { ascending: false });
      setTasks(data ?? []);
    })();
  }, []);

  const agentName = (id: string) => agents.find((a) => a.id === id)?.name ?? "—";

  return (
    <div className="container py-6 sm:py-10 animate-fade-up">
      <PageHeader eyebrow="Workboard" title="Tasks" subtitle="Cross-agent work in flight." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLS.map((col) => (
          <div key={col} className="panel p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="eyebrow">{col.replace("_", " ")}</p>
              <span className="font-mono text-[10px] text-muted-foreground">{tasks.filter((t) => t.status === col).length}</span>
            </div>
            <ul className="space-y-2">
              {tasks.filter((t) => t.status === col).map((t) => (
                <li key={t.id} className={cn("rounded border border-border p-2 text-xs bg-card/50")}>
                  <p className="font-medium">{t.title}</p>
                  <p className="font-mono text-[10px] text-muted-foreground mt-1">{agentName(t.agent_id)} · {t.priority}</p>
                </li>
              ))}
              {tasks.filter((t) => t.status === col).length === 0 && (
                <li className="text-xs text-muted-foreground italic">empty</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}