import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth, useHasMinRole } from "@/hooks/useAuth";
import { toast } from "sonner";
import { EmptyState } from "@/components/app/EmptyState";

export default function Settings() {
  const { user, roles } = useAuth();
  const isOwner = useHasMinRole("owner");
  const isAdmin = useHasMinRole("admin");
  const [profile, setProfile] = useState<any>(null);
  const [gateway, setGateway] = useState<string>("");
  const [funnelUrl, setFunnelUrl] = useState<string>("");
  const [defaultModel, setDefaultModel] = useState<string>("");
  const [pricing, setPricing] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setProfile(p);
      const { data: g } = await supabase.from("openclaw_gateway_settings").select("*").maybeSingle();
      setGateway(g?.gateway_url ?? "");
      setFunnelUrl(g?.funnel_url ?? "");
      setDefaultModel(g?.default_model ?? "claude-sonnet-4-5");
      const { data: pr } = await supabase.from("model_pricing").select("*").order("provider").order("model");
      setPricing(pr ?? []);
      if (isOwner) {
        const { data: m } = await supabase.from("user_roles").select("user_id, role");
        setMembers(m ?? []);
      }
    })();
  }, [user, isOwner]);

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("profiles").update({
      display_name: fd.get("display_name") as string,
      avatar_url: (fd.get("avatar_url") as string) || null,
    }).eq("id", user!.id);
    if (error) return toast.error(error.message);
    toast.success("Profile saved.");
  }

  async function saveGateway() {
    const { data: existing } = await supabase.from("openclaw_gateway_settings").select("id").maybeSingle();
    const payload = {
      gateway_url: gateway || null,
      funnel_url: funnelUrl || null,
      default_model: defaultModel || null,
      updated_by: user?.id,
    };
    const { error } = existing
      ? await supabase.from("openclaw_gateway_settings").update(payload).eq("id", existing.id)
      : await supabase.from("openclaw_gateway_settings").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Gateway settings saved.");
  }

  async function updatePrice(id: string, field: "input_per_mtok_usd" | "output_per_mtok_usd", value: string) {
    const num = Number(value);
    if (!Number.isFinite(num)) return;
    const { error } = await supabase.from("model_pricing").update({ [field]: num } as any).eq("id", id);
    if (error) toast.error(error.message);
    else setPricing((p) => p.map((r) => r.id === id ? { ...r, [field]: num } : r));
  }

  async function testConnection() {
    setTesting(true);
    try {
      const { data: agents } = await supabase.from("agents").select("id, name").limit(1);
      if (!agents?.[0]) { toast.error("Need at least one agent to test"); return; }
      const { data, error } = await supabase.functions.invoke("openclaw-send", {
        body: { agent_id: agents[0].id, content: "ping from operating room" },
      });
      if (error) { toast.error(error.message); return; }
      const jobId = (data as any)?.job_id;
      if ((data as any)?.error || !jobId) {
        toast.error((data as any)?.error ?? "Failed to queue test job");
        return;
      }
      toast.success("Job queued. Waiting for the Mac worker to lease it…");
      // Poll for the worker to lease + complete the job (up to 15s)
      const start = Date.now();
      while (Date.now() - start < 15000) {
        await new Promise((r) => setTimeout(r, 1000));
        const { data: j } = await supabase
          .from("agent_jobs" as any)
          .select("status, leased_at, error")
          .eq("id", jobId)
          .maybeSingle();
        if (!j) continue;
        if ((j as any).status === "leased" || (j as any).status === "done") {
          toast.success(`Worker is alive — job ${(j as any).status}.`);
          return;
        }
        if ((j as any).status === "failed") {
          const err = (j as any).error ?? "unknown";
          if (typeof err === "string" && /context engine.*legacy.*not registered/i.test(err)) {
            toast.error(
              "Worker is sending an outdated spawn payload (contains runtime:'subagent'). Pull the latest scripts/openclaw-worker.sh and restart it."
            );
          } else if (typeof err === "string" && err.includes("Tool not available")) {
            toast.error(
              "Worker leased the job but the gateway blocked sessions_spawn. Run: openclaw config set gateway.tools.allow '[\"sessions_spawn\",\"sessions_send\"]' && openclaw gateway restart"
            );
          } else {
            toast.error(`Worker reported failure: ${err}`);
          }
          return;
        }
      }
      toast.warning(
        "No worker leased the job in 15s. Start scripts/openclaw-worker.sh on your Mac with OPENCLAW_HOOK_TOKEN set, or check the Infra page runbook."
      );
    } finally { setTesting(false); }
  }

  return (
    <div className="container py-6 sm:py-10 animate-fade-up">
      <PageHeader eyebrow="Configuration" title="Settings" />
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile" className="font-mono text-[10px] uppercase tracking-wider">Profile</TabsTrigger>
          {isOwner && <TabsTrigger value="team" className="font-mono text-[10px] uppercase tracking-wider">Team</TabsTrigger>}
          {isAdmin && <TabsTrigger value="integrations" className="font-mono text-[10px] uppercase tracking-wider">Integrations</TabsTrigger>}
          {isAdmin && <TabsTrigger value="pricing" className="font-mono text-[10px] uppercase tracking-wider">Model Pricing</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <form onSubmit={saveProfile} className="panel p-5 space-y-4 max-w-lg">
            <Field name="display_name" label="Display name" defaultValue={profile?.display_name ?? ""} />
            <Field name="avatar_url" label="Avatar URL" defaultValue={profile?.avatar_url ?? ""} />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Email</p>
              <p className="text-sm mt-1">{user?.email}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Roles</p>
              <p className="text-sm mt-1">{roles.join(", ") || "viewer"}</p>
            </div>
            <Button type="submit">Save profile</Button>
          </form>
        </TabsContent>

        {isOwner && (
          <TabsContent value="team" className="mt-6">
            <div className="panel p-5">
              <h3 className="eyebrow mb-3">Team members</h3>
              {members.length === 0 ? <p className="text-sm text-muted-foreground">No members yet.</p> : (
                <ul className="space-y-2 text-sm">
                  {members.map((m, i) => (
                    <li key={i} className="flex justify-between border-b border-border/50 py-2 font-mono text-xs">
                      <span>{m.user_id}</span>
                      <span className="text-primary">{m.role}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="integrations" className="mt-6 space-y-4">
            <div className="panel p-5 space-y-4 max-w-2xl">
              <h3 className="eyebrow">OpenClaw gateway</h3>

              <div className="space-y-2">
                <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Worker setup (your Mac pulls jobs)
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Jobs are now queued in the database. Run the worker script on your Mac — no Tailscale Funnel needed.
                  You can <code className="font-mono">tailscale funnel reset</code> and reclaim port 18789 for OpenClaw only.
                </p>
                <pre className="font-mono text-[11px] bg-card border border-border rounded-md p-3 overflow-x-auto whitespace-pre">
{`export OPENCLAW_HOOK_TOKEN=...   # same value as backend secret
chmod +x scripts/openclaw-worker.sh
./scripts/openclaw-worker.sh`}
                </pre>
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Default model</Label>
                <select
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {pricing.map((m) => (
                    <option key={m.id} value={m.model}>{m.provider} / {m.model}</option>
                  ))}
                </select>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Hook token and callback secret are stored in backend secrets, never in the browser.
                The worker uses the same hook token as a bearer to pull jobs.
              </p>

              <div className="flex gap-2">
                <Button onClick={saveGateway}>Save gateway</Button>
                <Button onClick={testConnection} variant="outline" disabled={testing}>
                  {testing ? "Testing…" : "Test connection"}
                </Button>
              </div>
            </div>
            <EmptyState title="GitHub & Exchange connections" body="Coming next — connect repos and exchange API keys here." />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="pricing" className="mt-6">
            <div className="panel p-5">
              <h3 className="eyebrow mb-3">Model pricing (USD per 1M tokens)</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="py-2">Provider</th>
                    <th className="py-2">Model</th>
                    <th className="py-2 w-32">Input</th>
                    <th className="py-2 w-32">Output</th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.map((m) => (
                    <tr key={m.id} className="border-b border-border/50">
                      <td className="py-2 font-mono text-xs">{m.provider}</td>
                      <td className="py-2 font-mono text-xs">{m.model}</td>
                      <td className="py-2"><Input type="number" step="0.01" defaultValue={m.input_per_mtok_usd} onBlur={(e) => updatePrice(m.id, "input_per_mtok_usd", e.target.value)} className="h-8" /></td>
                      <td className="py-2"><Input type="number" step="0.01" defaultValue={m.output_per_mtok_usd} onBlur={(e) => updatePrice(m.id, "output_per_mtok_usd", e.target.value)} className="h-8" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[11px] text-muted-foreground mt-3">Edit and click outside the field to save. Used to compute per-message cost.</p>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</Label>
      <Input id={name} name={name} defaultValue={defaultValue} />
    </div>
  );
}
