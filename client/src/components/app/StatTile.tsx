import { cn } from "@/lib/utils";

export function StatTile({ label, value, hint, tone = "default" }: { label: string; value: string | number; hint?: string; tone?: "default" | "primary" | "warning" | "destructive" }) {
  const valueCls = {
    default: "text-foreground",
    primary: "text-primary",
    warning: "text-warning",
    destructive: "text-destructive",
  }[tone];
  return (
    <div className="panel p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className={cn("text-3xl font-bold mt-2 font-mono", valueCls)}>{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}