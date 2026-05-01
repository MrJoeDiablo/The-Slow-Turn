import { useGatewayHealth } from "@/hooks/useGatewayHealth";
import { cn } from "@/lib/utils";

export function GatewayPill() {
  const h = useGatewayHealth();
  const status = h?.status ?? "not_configured";
  const cfg = {
    online:          { dot: "bg-success",          text: "text-success",          label: `Gateway ${h?.latency_ms ?? 0}ms` },
    degraded:        { dot: "bg-warning",          text: "text-warning",          label: "Gateway degraded" },
    offline:         { dot: "bg-destructive",      text: "text-destructive",      label: "Gateway offline" },
    not_configured:  { dot: "bg-muted-foreground", text: "text-muted-foreground", label: "Gateway not configured" },
  }[status];

  return (
    <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card">
      <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse-dot", cfg.dot)} />
      <span className={cn("font-mono text-[10px] uppercase tracking-wider", cfg.text)}>{cfg.label}</span>
    </div>
  );
}