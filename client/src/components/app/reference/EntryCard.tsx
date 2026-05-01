import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Entry, EntryStatus } from "@/lib/reference/catalog";

const statusStyles: Record<EntryStatus, string> = {
  verified: "bg-primary/10 text-primary border-primary/30",
  "session-only": "bg-blue-500/10 text-blue-400 border-blue-500/30",
  "built-in": "bg-muted text-muted-foreground border-border",
  connected: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  invalid: "bg-destructive/10 text-destructive border-destructive/30",
};

export function EntryCard({ entry }: { entry: Entry }) {
  const [copied, setCopied] = useState(false);

  const copyText = entry.example ?? entry.name;
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div className="panel p-4 group hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <button
          onClick={onCopy}
          className="font-mono text-sm text-foreground text-left hover:text-primary transition-colors flex items-center gap-2 min-w-0"
          title="Copy"
        >
          <span className="truncate">{entry.name}</span>
          {copied ? <Check size={12} className="text-primary shrink-0" /> : <Copy size={12} className="opacity-0 group-hover:opacity-60 shrink-0" />}
        </button>
        <Badge variant="outline" className={cn("font-mono text-[9px] uppercase tracking-wider shrink-0", statusStyles[entry.status])}>
          {entry.status}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{entry.description}</p>
      {entry.actions && entry.actions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {entry.actions.map((a) => (
            <span key={a} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/50">
              {a}
            </span>
          ))}
        </div>
      )}
      {entry.whenToUse && (
        <p className="text-[11px] text-muted-foreground/80 mt-3 italic border-l-2 border-border pl-2">{entry.whenToUse}</p>
      )}
      {entry.example && entry.example !== entry.name && (
        <pre className="mt-3 font-mono text-[11px] text-foreground/80 bg-muted/40 border border-border/50 rounded px-2 py-1.5 overflow-x-auto">
          {entry.example}
        </pre>
      )}
    </div>
  );
}