import { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type Kind = "health" | "status" | "config";

interface Props {
  kind: Kind;
  title: string;
  description: string;
  command: string;
}

export function DiagnosticsCard({ kind, title, description, command }: Props) {
  const [copied, setCopied] = useState(false);
  const [raw, setRaw] = useState("");

  const parsed = useMemo(() => {
    if (!raw.trim()) return null;
    try {
      // Strip optional "Gateway call: <name>\n" header.
      const cleaned = raw.replace(/^Gateway call:[^\n]*\n/, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return { __error: "Invalid JSON" };
    }
  }, [raw]);

  const onCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="panel p-4 space-y-3">
      <div>
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-foreground">{title}</h3>
          <Badge variant="outline" className="font-mono text-[9px] uppercase tracking-wider">{kind}</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
      <button
        onClick={onCopy}
        className="w-full font-mono text-[11px] text-foreground/80 bg-muted/40 border border-border/50 rounded px-2 py-1.5 flex items-center justify-between hover:border-primary/40 transition-colors"
      >
        <span className="truncate text-left">{command}</span>
        {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} className="opacity-60" />}
      </button>
      <Textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder="Paste JSON output here to visualize…"
        className="font-mono text-[11px] min-h-[80px]"
      />
      {parsed && <Summary kind={kind} data={parsed} />}
    </div>
  );
}

function Summary({ kind, data }: { kind: Kind; data: any }) {
  if (data?.__error) {
    return <p className="text-xs text-destructive font-mono">{data.__error}</p>;
  }

  if (kind === "health") {
    const plugins: string[] = data?.plugins?.loaded ?? [];
    return (
      <div className="space-y-2 border-t border-border/50 pt-3">
        <div className="flex flex-wrap gap-3 text-[11px] font-mono">
          <Stat label="ok" value={String(data?.ok ?? "—")} good={data?.ok === true} />
          <Stat label="duration" value={`${data?.durationMs ?? "—"}ms`} />
          <Stat label="plugins" value={String(plugins.length)} />
        </div>
        {plugins.length > 0 && (
          <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
            {plugins.map((p) => (
              <span key={p} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/50">
                {p}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (kind === "status") {
    const tasks = data?.tasks?.byStatus ?? {};
    const channels: string[] = data?.channelSummary ?? [];
    const recent = data?.sessions?.recent ?? [];
    return (
      <div className="space-y-3 border-t border-border/50 pt-3">
        <div className="flex flex-wrap gap-3 text-[11px] font-mono">
          <Stat label="runtime" value={data?.runtimeVersion ?? "—"} />
          <Stat label="sessions" value={String(data?.sessions?.count ?? "—")} />
          <Stat label="tasks" value={String(data?.tasks?.total ?? "—")} />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {Object.entries(tasks).map(([k, v]) => (
            <div key={k} className="border border-border/50 rounded px-2 py-1.5 bg-muted/30">
              <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{k}</div>
              <div className="font-mono text-sm text-foreground">{String(v)}</div>
            </div>
          ))}
        </div>
        {channels.length > 0 && (
          <div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Channels</div>
            <ul className="font-mono text-[11px] text-foreground/80 space-y-0.5">
              {channels.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        )}
        {recent.length > 0 && (
          <div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Recent sessions</div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {recent.slice(0, 8).map((s: any) => (
                <div key={s.sessionId} className="font-mono text-[10px] flex justify-between gap-2 border-b border-border/30 pb-1">
                  <span className="text-foreground/80 truncate">{s.key}</span>
                  <span className="text-muted-foreground shrink-0">{s.percentUsed != null ? `${s.percentUsed}%` : "—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // config
  return (
    <div className="space-y-2 border-t border-border/50 pt-3">
      <pre className="font-mono text-[10px] text-foreground/80 bg-muted/40 border border-border/50 rounded p-2 overflow-x-auto max-h-64">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function Stat({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-muted-foreground uppercase tracking-wider text-[9px]">{label}</span>
      <span className={good ? "text-primary" : "text-foreground"}>{value}</span>
    </div>
  );
}