import { useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { StatTile } from "@/components/app/StatTile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitBranch, GitCommit, Plus, Rocket, Loader2, ExternalLink, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useGitHubRepos, useDeployments } from "@/hooks/useGitHub";
import { useAgents } from "@/hooks/useAgents";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const statusStyle = (s: string) => {
  if (s === "success" || s === "ok") return { icon: CheckCircle2, cls: "text-success border-success/40 bg-success/5" };
  if (s === "failed" || s === "error") return { icon: XCircle, cls: "text-destructive border-destructive/40 bg-destructive/5" };
  if (s === "running" || s === "pending") return { icon: Clock, cls: "text-primary border-primary/40 bg-primary/5" };
  return { icon: Clock, cls: "text-muted-foreground border-border bg-muted/30" };
};

export default function GitHub() {
  const { data: repos, loading } = useGitHubRepos();
  const { data: deployments } = useDeployments(40);
  const { data: agents = [] } = useAgents();

  const successCount = deployments.filter((d) => d.status === "success").length;
  const failedCount = deployments.filter((d) => d.status === "failed").length;

  return (
    <div className="container py-6 sm:py-10 animate-fade-up">
      <PageHeader
        eyebrow="Code · Deploy"
        title="GitHub & Deployments"
        subtitle="Connected repos, owning agents, and the deploy timeline."
        actions={<AddRepoDialog agents={agents} />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatTile label="Repos" value={repos.length} hint="Connected to The Slow Turn" />
        <StatTile label="Deployments" value={deployments.length} hint="Tracked across all repos" />
        <StatTile label="Successful" value={successCount} tone="primary" />
        <StatTile label="Failed" value={failedCount} tone={failedCount ? "destructive" : "default"} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Repos */}
        <div>
          <h2 className="eyebrow mb-3">Repositories</h2>
          <Card className="panel overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-muted-foreground text-sm">Loading…</div>
            ) : repos.length === 0 ? (
              <EmptyState
                icon={<GitBranch size={32} />}
                title="No repos connected"
                body="Add a GitHub repo to track commits, deployments, and the owning agent."
              />
            ) : (
              <ul className="divide-y divide-border">
                {repos.map((r) => {
                  const owner = agents.find((a) => a.id === r.agent_id);
                  return (
                    <li key={r.id} className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <a
                          href={`https://github.com/${r.owner}/${r.name}`}
                          target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 font-mono text-sm hover:text-primary transition-colors truncate"
                        >
                          <GitBranch className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          {r.owner}/{r.name}
                          <ExternalLink className="h-3 w-3 opacity-60" />
                        </a>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                          <span>branch {r.default_branch}</span>
                          {owner && <><span>·</span><span>owned by <span className="text-primary">{owner.name}</span></span></>}
                          {r.last_commit_at && <><span>·</span><span>last commit {formatDistanceToNow(new Date(r.last_commit_at), { addSuffix: true })}</span></>}
                        </p>
                      </div>
                      <DeployButton repoId={r.id} />
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        {/* Deployments timeline */}
        <div>
          <h2 className="eyebrow mb-3">Deployments</h2>
          <Card className="panel overflow-hidden">
            {deployments.length === 0 ? (
              <EmptyState
                icon={<Rocket size={32} />}
                title="No deployments tracked"
                body="Trigger a deploy from a repo to see it here."
              />
            ) : (
              <ul className="divide-y divide-border max-h-[520px] overflow-auto">
                {deployments.map((d) => {
                  const repo = repos.find((r) => r.id === d.repo_id);
                  const s = statusStyle(d.status);
                  return (
                    <li key={d.id} className="p-4 flex items-center gap-3">
                      <span className={`h-7 w-7 rounded-full border flex items-center justify-center ${s.cls}`}>
                        <s.icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs truncate">
                          {repo ? `${repo.owner}/${repo.name}` : "(deleted repo)"} <span className="text-muted-foreground">· {d.environment}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                          <span>{formatDistanceToNow(new Date(d.started_at), { addSuffix: true })}</span>
                          {d.commit_sha && <><span>·</span><span className="font-mono"><GitCommit className="inline h-3 w-3 mr-0.5" />{d.commit_sha.slice(0, 7)}</span></>}
                        </p>
                      </div>
                      <Badge variant="outline" className={`font-mono text-[10px] uppercase ${s.cls}`}>
                        {d.status}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function DeployButton({ repoId }: { repoId: string }) {
  const [busy, setBusy] = useState(false);
  async function trigger() {
    setBusy(true);
    // Mock deploy: insert a 'pending' deployment, then mark success after a delay.
    // TODO: wire to a real GitHub Actions / Vercel webhook via an edge function.
    const sha = Math.random().toString(16).slice(2, 9);
    const { data, error } = await supabase.from("deployments").insert({
      repo_id: repoId,
      environment: "production",
      status: "running",
      commit_sha: sha,
    }).select().single();
    if (error) { setBusy(false); return toast.error(error.message); }
    toast.success(`Deploy started · ${sha}`);
    setTimeout(async () => {
      await supabase.from("deployments").update({
        status: Math.random() > 0.15 ? "success" : "failed",
        finished_at: new Date().toISOString(),
      }).eq("id", data.id);
      setBusy(false);
    }, 2500);
  }
  return (
    <Button size="sm" variant="outline" disabled={busy} onClick={trigger} className="font-mono text-[10px] uppercase tracking-[0.15em]">
      {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Rocket className="mr-1 h-3 w-3" />Deploy</>}
    </Button>
  );
}

function AddRepoDialog({ agents }: { agents: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [owner, setOwner] = useState("");
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("main");
  const [agentId, setAgentId] = useState<string>("none");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("github_repos").insert({
      owner, name, default_branch: branch,
      agent_id: agentId === "none" ? null : agentId,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Repo connected.");
    setOpen(false);
    setOwner(""); setName("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="font-mono text-xs uppercase tracking-[0.15em]">
          <Plus className="mr-1 h-3.5 w-3.5" /> Connect repo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Connect GitHub repo</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Owner</Label>
              <Input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="theslowturn" required />
            </div>
            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Repo name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="axiom" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Branch</Label>
              <Input value={branch} onChange={(e) => setBranch(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Owning agent</Label>
              <Select value={agentId} onValueChange={setAgentId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {agents.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            TODO: real OAuth + webhook wiring lands when we connect Lovable→GitHub. For now this just stores the link.
          </p>
          <DialogFooter>
            <Button type="submit" disabled={busy} className="font-mono text-xs uppercase tracking-[0.15em] w-full">
              {busy ? <Loader2 className="animate-spin" /> : "Connect repo →"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}