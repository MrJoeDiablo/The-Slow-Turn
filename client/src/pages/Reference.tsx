import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchBar } from "@/components/app/reference/SearchBar";
import { EntryCard } from "@/components/app/reference/EntryCard";
import { DiagnosticsCard } from "@/components/app/reference/DiagnosticsCard";
import { ENTRIES, CLI_CATEGORIES, TOOL_CATEGORIES, type Entry } from "@/lib/reference/catalog";
import { cn } from "@/lib/utils";

function filterEntries(entries: Entry[], q: string, cat: string) {
  const needle = q.trim().toLowerCase();
  return entries.filter((e) => {
    if (cat !== "All" && e.category !== cat) return false;
    if (!needle) return true;
    return (
      e.name.toLowerCase().includes(needle) ||
      e.description.toLowerCase().includes(needle) ||
      (e.example?.toLowerCase().includes(needle) ?? false) ||
      (e.actions?.some((a) => a.toLowerCase().includes(needle)) ?? false)
    );
  });
}

function CategoryChips({ categories, value, onChange }: { categories: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {["All", ...categories].map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={cn(
            "font-mono text-[10px] uppercase tracking-wider px-3 py-1 rounded border transition-colors",
            value === c
              ? "border-primary text-primary bg-primary/10"
              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
          )}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

export default function Reference() {
  const cli = useMemo(() => ENTRIES.filter((e) => e.surface === "cli"), []);
  const tools = useMemo(() => ENTRIES.filter((e) => e.surface === "agent-tool"), []);
  const slashes = useMemo(() => ENTRIES.filter((e) => e.surface === "slash"), []);

  const [cliQ, setCliQ] = useState("");
  const [cliCat, setCliCat] = useState<string>("All");
  const [toolQ, setToolQ] = useState("");
  const [toolCat, setToolCat] = useState<string>("All");

  const cliFiltered = filterEntries(cli, cliQ, cliCat);
  const toolFiltered = filterEntries(tools, toolQ, toolCat);

  return (
    <div className="container py-6 sm:py-10 animate-fade-up">
      <PageHeader
        eyebrow="Phase 5"
        title="Reference"
        subtitle="OpenClaw CLI, agent tools, slash commands, and live gateway diagnostics."
      />

      <Tabs defaultValue="cli" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-xl">
          <TabsTrigger value="cli" className="font-mono text-[10px] uppercase tracking-wider">CLI</TabsTrigger>
          <TabsTrigger value="tools" className="font-mono text-[10px] uppercase tracking-wider">Tools</TabsTrigger>
          <TabsTrigger value="diag" className="font-mono text-[10px] uppercase tracking-wider">Slash · Diag</TabsTrigger>
        </TabsList>

        {/* CLI tab */}
        <TabsContent value="cli" className="mt-6 space-y-4">
          <SearchBar value={cliQ} onChange={setCliQ} placeholder="Search CLI… (press /)" />
          <CategoryChips categories={[...CLI_CATEGORIES]} value={cliCat} onChange={setCliCat} />
          {cliFiltered.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 font-mono text-xs">No matches.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {cliFiltered.map((e) => <EntryCard key={e.id} entry={e} />)}
            </div>
          )}
        </TabsContent>

        {/* Tools tab */}
        <TabsContent value="tools" className="mt-6 space-y-4">
          <SearchBar value={toolQ} onChange={setToolQ} placeholder="Search tools… (press /)" />
          <CategoryChips categories={[...TOOL_CATEGORIES]} value={toolCat} onChange={setToolCat} />
          {toolFiltered.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 font-mono text-xs">No matches.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {toolFiltered.map((e) => <EntryCard key={e.id} entry={e} />)}
            </div>
          )}
        </TabsContent>

        {/* Diagnostics tab */}
        <TabsContent value="diag" className="mt-6 space-y-6">
          <section className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">Slash commands · run inside an agent chat</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {slashes.map((e) => <EntryCard key={e.id} entry={e} />)}
            </div>
          </section>
          <section className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">Gateway diagnostics · paste output to visualize</h2>
            <div className="grid gap-3 lg:grid-cols-2">
              <DiagnosticsCard
                kind="health"
                title="gateway call health"
                description="Liveness check + loaded plugins."
                command="openclaw gateway call health"
              />
              <DiagnosticsCard
                kind="status"
                title="gateway call status"
                description="Runtime version, channels, task counters, recent sessions."
                command="openclaw gateway call status"
              />
              <DiagnosticsCard
                kind="config"
                title="gateway call config.get"
                description="Effective gateway configuration (loopback bind, auth mode)."
                command="openclaw gateway call config.get"
              />
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}