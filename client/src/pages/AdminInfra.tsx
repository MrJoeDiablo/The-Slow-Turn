import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGatewayHealth } from "@/hooks/useGatewayHealth";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Loader2, RefreshCcw, Trash2, Server, Database, KeyRound, BookOpen, Shield } from "lucide-react";
import { Navigate } from "react-router-dom";

type Agent = { id: string; slug: string; name: string; role_title: string };
type Job = {
  id: string;
  status: string;
  agent_id: string;
  message_id: string;
  created_at: string;
  leased_at: string | null;
  leased_by: string | null;
  error: string | null;
  payload: any;
};

const RUNBOOK = `## Architecture (pull-based — no tunnel needed)

The Lovable backend queues jobs in the database. Your Mac runs \`scripts/openclaw-worker.sh\`, which polls the backend, calls the local OpenClaw gateway at \`127.0.0.1:18789\`, and posts the reply back. Tailscale Funnel is not required.

## Verified working state (2026-04-30)

✅ Gateway HTTP deny list — fixed. \`gateway.tools.allow = ["sessions_spawn","sessions_send"]\` is persisted.
✅ Models + auth for agent \`main\` — fully configured. Default \`anthropic/claude-haiku-4-5\`, 11 models, 7 provider keys (anthropic, openai, google, groq, perplexity, elevenlabs, ollama).
✅ \`sessions_spawn\` over POST /tools/invoke — returns \`status:"accepted"\` with a real \`childSessionKey\` and \`runId\`.

## The verified working spawn payload

\`\`\`json
{"tool":"sessions_spawn","args":{"agentId":"main","task":"...","label":"..."}}
\`\`\`

**Never include \`runtime\`** (e.g. \`runtime:"subagent"\`). The gateway falls back to a context engine called \`"legacy"\` which doesn't exist and returns \`status:"error"\`. The worker script no longer sends \`runtime\` — if you see this error, the Mac is running an old copy of \`scripts/openclaw-worker.sh\`.

## Start the worker on your Mac (one command at a time)

\`\`\`bash
export OPENCLAW_HOOK_TOKEN='<value from Cloud secrets>'
\`\`\`

\`\`\`bash
cd /path/to/this/repo
\`\`\`

\`\`\`bash
bash scripts/openclaw-worker.sh
\`\`\`

## After updating the worker script

Stop the running worker (Ctrl-C in its terminal), pull the latest code, then re-run the same \`bash scripts/openclaw-worker.sh\` command. No gateway restart needed for worker changes.

## Diagnostic decision tree

- **"No worker leased the queued job in 15s"** → worker not running, can't reach the backend, or \`OPENCLAW_HOOK_TOKEN\` mismatch.
- **Worker logs show \`Context engine "legacy" is not registered\`** → outdated worker script. Stop, pull, restart.
- **Worker logs show \`Tool not available: sessions_spawn\`** → gateway deny list got reset. Re-run \`openclaw config set gateway.tools.allow '["sessions_spawn","sessions_send"]' && openclaw gateway restart\`.
- **Worker logs show an auth error from the gateway** → token mismatch between Mac env and gateway config.

## DB slug must match gateway agentId

The worker passes the agent's \`slug\` field directly as \`agentId\` to \`sessions_spawn\`. Confirmed gateway agents: \`main, cora, vera, kade, luca, finn, axiom, mira, castor\`.

## Gateway facts (verified)

- URL: http://127.0.0.1:18789 (mode=local, auth.mode=token)
- Real API: **POST** /tools/invoke only. GET /tools/list and GET /tools/describe both return the OpenClaw Control SPA HTML — they are NOT the API.
- Auth header: \`Authorization: Bearer $OPENCLAW_HOOK_TOKEN\`
- Version: 2026.4.26 (be8c246)
`;

export default function AdminInfra() {
  const { roles, loading: authLoading } = useAuth();
  const isAdmin = roles.includes("admin") || roles.includes("owner");
  const qc = useQueryClient();
  const health = useGatewayHealth(15000);

  // Agents
  const agentsQ = useQuery({
    queryKey: ["admin-agents"],
    queryFn: async (): Promise<Agent[]> => {
      const { data, error } = await supabase.from("agents").select("id,slug,name,role_title").order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: isAdmin,
  });

  // Jobs (latest 50)
  const jobsQ = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async (): Promise<Job[]> => {
      const { data, error } = await supabase
        .from("agent_jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as Job[];
    },
    enabled: isAdmin,
    refetchInterval: 5000,
  });

  const updateSlug = useMutation({
    mutationFn: async ({ id, slug }: { id: string; slug: string }) => {
      const { error } = await supabase.from("agents").update({ slug }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Slug updated" });
      qc.invalidateQueries({ queryKey: ["admin-agents"] });
    },
    onError: (e: any) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  if (authLoading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;
  if (!isAdmin) return <Navigate to="/app" replace />;

  return (
    <div className="container max-w-6xl mx-auto p-4 sm:p-6">
      <PageHeader
        eyebrow="admin"
        title="Infra & gateway"
        subtitle="Live state of the OpenClaw bridge, agent ↔ subagent mapping, the job queue, and runbook."
        actions={
          <Button size="sm" variant="outline" onClick={() => { qc.invalidateQueries(); }}>
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        }
      />

      {/* Status row */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Server className="h-3.5 w-3.5" /> Gateway
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold capitalize">{health?.status ?? "checking…"}</div>
            <div className="text-xs text-muted-foreground font-mono mt-1">
              {health?.latency_ms != null ? `${health.latency_ms}ms` : "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Database className="h-3.5 w-3.5" /> Jobs (last 50)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {jobsQ.data?.filter(j => j.status === "pending").length ?? 0} pending
            </div>
            <div className="text-xs text-muted-foreground font-mono mt-1">
              {jobsQ.data?.filter(j => j.status === "leased").length ?? 0} leased ·{" "}
              {jobsQ.data?.filter(j => j.status === "failed").length ?? 0} failed
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <KeyRound className="h-3.5 w-3.5" /> Worker token
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">configured</div>
            <div className="text-xs text-muted-foreground font-mono mt-1">OPENCLAW_HOOK_TOKEN</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="agents">
        <TabsList className="mb-4">
          <TabsTrigger value="agents"><Shield className="h-3.5 w-3.5 mr-2" />Agent mapping</TabsTrigger>
          <TabsTrigger value="jobs"><Database className="h-3.5 w-3.5 mr-2" />Job queue</TabsTrigger>
          <TabsTrigger value="runbook"><BookOpen className="h-3.5 w-3.5 mr-2" />Runbook</TabsTrigger>
        </TabsList>

        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">DB slug → gateway agentId</CardTitle>
              <p className="text-xs text-muted-foreground">
                The worker passes the slug below as <code className="font-mono">agentId</code> to{" "}
                <code className="font-mono">sessions_spawn</code>. They must match a registered subagent on your gateway.
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Slug (= gateway agentId)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentsQ.data?.map((a) => (
                    <SlugRow key={a.id} agent={a} onSave={(slug) => updateSlug.mutate({ id: a.id, slug })} />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Latest 50 jobs</CardTitle>
              <p className="text-xs text-muted-foreground">Auto-refreshes every 5 s.</p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Worker</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobsQ.data?.map((j) => (
                    <JobRow key={j.id} job={j} onChanged={() => qc.invalidateQueries({ queryKey: ["admin-jobs"] })} />
                  ))}
                  {jobsQ.data?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">
                        No jobs yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runbook">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Operations runbook</CardTitle>
              <p className="text-xs text-muted-foreground">
                Same notes the AI keeps in memory. Edit by updating <code className="font-mono">src/pages/app/AdminInfra.tsx</code> RUNBOOK constant.
              </p>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-xs font-mono leading-relaxed bg-muted/40 rounded-md p-4 overflow-auto">
                {RUNBOOK}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SlugRow({ agent, onSave }: { agent: Agent; onSave: (slug: string) => void }) {
  const [val, setVal] = useState(agent.slug);
  useEffect(() => { setVal(agent.slug); }, [agent.slug]);
  const dirty = val !== agent.slug;
  return (
    <TableRow>
      <TableCell className="font-medium">{agent.name}</TableCell>
      <TableCell className="text-xs text-muted-foreground">{agent.role_title}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Input value={val} onChange={(e) => setVal(e.target.value)} className="h-8 font-mono text-xs max-w-[200px]" />
          {dirty && (
            <Button size="sm" onClick={() => onSave(val.trim())} className="h-8">Save</Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function JobRow({ job, onChanged }: { job: Job; onChanged: () => void }) {
  const slug = job.payload?.slug ?? "—";
  const created = new Date(job.created_at).toLocaleTimeString();
  const variant: any = job.status === "pending" ? "secondary" : job.status === "leased" ? "default" : job.status === "failed" ? "destructive" : "outline";

  async function deleteJob() {
    const { error } = await supabase.from("agent_jobs").delete().eq("id", job.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Job deleted" });
      onChanged();
    }
  }

  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{created}</TableCell>
      <TableCell><Badge variant={variant} className="text-[10px]">{job.status}</Badge></TableCell>
      <TableCell className="font-mono text-xs">{slug}</TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">{job.leased_by ?? "—"}</TableCell>
      <TableCell className="font-mono text-[10px] text-destructive max-w-[300px] truncate" title={job.error ?? ""}>
        {job.error ?? "—"}
      </TableCell>
      <TableCell>
        <Button size="icon" variant="ghost" onClick={deleteJob} className="h-7 w-7">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}