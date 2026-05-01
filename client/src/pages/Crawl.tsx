import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Flame, Copy, Loader2, Trash2, ChevronRight } from "lucide-react";

interface Job {
  id: string;
  url: string;
  mode: string;
  status: string;
  markdown: string | null;
  error: string | null;
  credits_used: number | null;
  duration_ms: number | null;
  created_at: string;
}

export default function Crawl() {
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<"scrape" | "crawl">("scrape");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string>("");
  const [meta, setMeta] = useState<{ credits?: number | null; durationMs?: number | null; error?: string }>({});
  const [history, setHistory] = useState<Job[]>([]);
  const [selected, setSelected] = useState<Job | null>(null);

  const loadHistory = async () => {
    const { data } = await supabase
      .from("firecrawl_jobs")
      .select("id, url, mode, status, markdown, error, credits_used, duration_ms, created_at")
      .order("created_at", { ascending: false })
      .limit(25);
    setHistory(data ?? []);
  };

  useEffect(() => { loadHistory(); }, []);

  const runCrawl = async () => {
    if (!url.trim()) {
      toast.error("Enter a URL");
      return;
    }
    setRunning(true);
    setResult("");
    setMeta({});
    try {
      const { data, error } = await supabase.functions.invoke("firecrawl-crawl", {
        body: { url: url.trim(), mode },
      });
      if (error) throw error;
      if (!data?.ok) {
        setMeta({ error: data?.error ?? "Crawl failed" });
        toast.error(data?.error ?? "Crawl failed");
      } else {
        setResult(data.markdown ?? "(no content)");
        setMeta({ credits: data.creditsUsed, durationMs: data.durationMs });
        toast.success(`Crawled — ${data.creditsUsed ?? "?"} credits`);
      }
      await loadHistory();
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      setMeta({ error: msg });
      toast.error(msg);
    } finally {
      setRunning(false);
    }
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  const remove = async (id: string) => {
    await supabase.from("firecrawl_jobs").delete().eq("id", id);
    if (selected?.id === id) setSelected(null);
    await loadHistory();
  };

  const showJob = (j: Job) => {
    setSelected(j);
    setResult(j.markdown ?? j.error ?? "(empty)");
    setMeta({ credits: j.credits_used, durationMs: j.duration_ms, error: j.error ?? undefined });
    setUrl(j.url);
  };

  return (
    <div className="container py-6 sm:py-10 animate-fade-up">
      <PageHeader
        eyebrow="Web crawl"
        title="FireCrawl"
        subtitle="Pull cleaned page content without burning agent tokens on browser navigation."
      />

      <div className="panel p-4 mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            onKeyDown={(e) => { if (e.key === "Enter" && !running) runCrawl(); }}
            className="flex-1"
          />
          <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
            <TabsList>
              <TabsTrigger value="scrape">Scrape</TabsTrigger>
              <TabsTrigger value="crawl">Crawl site</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={runCrawl} disabled={running} className="gap-2">
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flame className="h-4 w-4" />}
            {running ? "Crawling…" : "Run"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Scrape = single page. Crawl = follows links (limit 5). Free tier: 3 req/min.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="eyebrow">Result</h2>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {meta.credits != null && <span>{meta.credits} credits</span>}
              {meta.durationMs != null && <span>{(meta.durationMs / 1000).toFixed(1)}s</span>}
              {result && (
                <Button size="sm" variant="ghost" onClick={() => copy(result)} className="gap-1">
                  <Copy className="h-3 w-3" /> Copy
                </Button>
              )}
            </div>
          </div>
          <div className="panel p-4 max-h-[70vh] overflow-y-auto">
            {meta.error ? (
              <p className="text-sm text-destructive whitespace-pre-wrap">{meta.error}</p>
            ) : result ? (
              <pre className="text-xs whitespace-pre-wrap font-mono text-foreground/90">{result}</pre>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-12">
                Enter a URL and hit Run. Output appears here as markdown.
              </p>
            )}
          </div>
        </div>

        <div>
          <h2 className="eyebrow mb-3">History</h2>
          <div className="panel p-2 max-h-[70vh] overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No crawls yet.</p>
            ) : (
              <ul className="space-y-1">
                {history.map((j) => (
                  <li key={j.id}>
                    <div className={`group flex items-start gap-2 px-2 py-2 rounded-md hover:bg-accent cursor-pointer ${selected?.id === j.id ? "bg-accent" : ""}`}>
                      <button onClick={() => showJob(j)} className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={j.status === "success" ? "default" : j.status === "error" ? "destructive" : "secondary"} className="text-[10px]">
                            {j.status}
                          </Badge>
                          <span className="text-[10px] font-mono text-muted-foreground">{j.mode}</span>
                        </div>
                        <p className="text-xs truncate">{j.url}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(j.created_at).toLocaleString()}
                        </p>
                      </button>
                      <button
                        onClick={() => remove(j.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
