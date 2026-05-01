import { cn } from "@/lib/utils";
import type { AgentStatus } from "@/lib/openclaw/types";

const map: Record<AgentStatus, { label: string; cls: string; dot: string }> = {
  online:  { label: "Online",  cls: "border-success/40 text-success bg-success/5",        dot: "bg-success" },
  working: { label: "Working", cls: "border-primary/40 text-primary bg-primary/5",        dot: "bg-primary" },
  idle:    { label: "Idle",    cls: "border-muted-foreground/30 text-muted-foreground bg-muted/30", dot: "bg-muted-foreground" },
  error:   { label: "Error",   cls: "border-destructive/40 text-destructive bg-destructive/5", dot: "bg-destructive" },
  offline: { label: "Offline", cls: "border-border text-muted-foreground bg-transparent", dot: "bg-muted-foreground/40" },
};

export function StatusBadge({ status, className }: { status: AgentStatus; className?: string }) {
  const m = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border font-mono text-[10px] uppercase tracking-wider", m.cls, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse-dot", m.dot)} />
      {m.label}
    </span>
  );
}