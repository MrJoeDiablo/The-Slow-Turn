import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/app/StatusBadge";
import { MessageSquare, Terminal } from "lucide-react";
import type { AgentStatus } from "@/lib/openclaw/types";

interface Agent {
  id: string;
  name: string;
  role_title: string;
  avatar_url: string | null;
  status: AgentStatus;
  current_task: string | null;
  model: string | null;
  provider: string | null;
}

export function AgentCard({ agent }: { agent: Agent }) {
  const initials = agent.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="panel p-5 flex flex-col gap-4 hover:border-primary/40 transition-colors group">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 border border-border">
          <AvatarImage src={agent.avatar_url ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-primary font-mono text-sm">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 justify-between">
            <h3 className="font-semibold truncate">{agent.name}</h3>
            <StatusBadge status={agent.status} />
          </div>
          <p className="text-[11px] font-mono text-primary truncate">{agent.role_title}</p>
        </div>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Current task</p>
        <p className="text-sm text-foreground/90 line-clamp-2 min-h-[2.5em]">{agent.current_task ?? "—"}</p>
      </div>

      {(agent.provider || agent.model) && (
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-border text-muted-foreground">
            {agent.provider}/{agent.model}
          </span>
        </div>
      )}

      <div className="flex gap-2 mt-auto">
        <Button asChild size="sm" variant="outline" className="flex-1 font-mono text-[10px] uppercase tracking-wider">
          <Link to={`/app/chat/${agent.id}`}><MessageSquare size={13} className="mr-1.5" /> Chat</Link>
        </Button>
        <Button asChild size="sm" className="flex-1 font-mono text-[10px] uppercase tracking-wider">
          <Link to={`/app/agents/${agent.id}`}><Terminal size={13} className="mr-1.5" /> Console</Link>
        </Button>
      </div>
    </div>
  );
}