import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/app/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useHasMinRole, useAuth } from "@/hooks/useAuth";

const STEPS = ["Identity", "Model", "Access", "Tasks", "Review"] as const;

export default function NewAgent() {
  const nav = useNavigate();
  const { user } = useAuth();
  const canCreate = useHasMinRole("admin");
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    name: "", role_title: "", description: "", avatar_url: "",
    provider: "openai", model: "gpt-5", system_instructions: "",
    tools: { github: false, supabase: false, web: true, crypto: false },
    starting_tasks: "",
  });

  const update = (k: string, v: any) => setForm({ ...form, [k]: v });

  if (!canCreate) {
    return (
      <div className="container py-10">
        <PageHeader title="Create agent" />
        <div className="panel p-8 text-center text-sm text-muted-foreground">Admin or owner role required to create agents.</div>
      </div>
    );
  }

  async function create() {
    setBusy(true);
    const slug = form.name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const { data: agent, error } = await supabase.from("agents").insert({
      name: form.name, slug, role_title: form.role_title, description: form.description || null,
      avatar_url: form.avatar_url || null, status: "offline",
      provider: form.provider, model: form.model, system_instructions: form.system_instructions || null,
      created_by: user?.id,
    }).select().single();

    if (error || !agent) { setBusy(false); return toast.error(error?.message ?? "Failed"); }

    const permRows = Object.entries(form.tools).map(([tool_key, granted]) => ({ agent_id: agent.id, tool_key, granted }));
    if (permRows.length) await supabase.from("agent_permissions").insert(permRows);

    const taskLines = form.starting_tasks.split("\n").map((s) => s.trim()).filter(Boolean);
    if (taskLines.length) {
      await supabase.from("agent_tasks").insert(taskLines.map((title) => ({ agent_id: agent.id, title, created_by: user?.id })));
    }

    toast.success(`${agent.name} created.`);
    nav(`/app/agents/${agent.id}`);
  }

  return (
    <div className="container py-6 sm:py-10 max-w-2xl animate-fade-up">
      <PageHeader eyebrow={`Step ${step + 1} / ${STEPS.length}`} title={`New Agent — ${STEPS[step]}`} />

      <div className="panel p-6 space-y-5">
        {step === 0 && (
          <>
            <Field label="Name" value={form.name} onChange={(v) => update("name", v)} />
            <Field label="Role / title" value={form.role_title} onChange={(v) => update("role_title", v)} placeholder="e.g. CMO · Marketing" />
            <Field label="Avatar URL (optional)" value={form.avatar_url} onChange={(v) => update("avatar_url", v)} />
            <Area label="Description" value={form.description} onChange={(v) => update("description", v)} />
          </>
        )}
        {step === 1 && (
          <>
            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Provider</Label>
              <Select value={form.provider} onValueChange={(v) => update("provider", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Field label="Model" value={form.model} onChange={(v) => update("model", v)} />
            <Area label="System instructions" value={form.system_instructions} onChange={(v) => update("system_instructions", v)} rows={6} />
          </>
        )}
        {step === 2 && (
          <>
            {Object.entries(form.tools).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-border/50 pb-3">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider">{k}</p>
                  <p className="text-xs text-muted-foreground">{descs[k] ?? ""}</p>
                </div>
                <Switch checked={v as boolean} onCheckedChange={(c) => update("tools", { ...form.tools, [k]: c })} />
              </div>
            ))}
          </>
        )}
        {step === 3 && (
          <Area label="Starting to-do list (one per line)" value={form.starting_tasks} onChange={(v) => update("starting_tasks", v)} rows={8} />
        )}
        {step === 4 && (
          <div className="space-y-3 text-sm">
            <Row k="Name" v={form.name || "—"} />
            <Row k="Role" v={form.role_title || "—"} />
            <Row k="Model" v={`${form.provider}/${form.model}`} />
            <Row k="Tools" v={Object.entries(form.tools).filter(([, v]) => v).map(([k]) => k).join(", ") || "none"} />
            <Row k="Starting tasks" v={String(form.starting_tasks.split("\n").filter(Boolean).length)} />
          </div>
        )}

        <div className="flex justify-between pt-4 border-t border-border/50">
          <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Back</Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={step === 0 && (!form.name || !form.role_title)}>Next</Button>
          ) : (
            <Button onClick={create} disabled={busy}>{busy ? "Creating…" : "Create agent"}</Button>
          )}
        </div>
      </div>
    </div>
  );
}

const descs: Record<string, string> = {
  github: "Read/write access to connected GitHub repos (Phase 2)",
  supabase: "Read/write access to project database",
  web: "Web research and fetch tools",
  crypto: "Trading actions through the exchange-proxy edge function",
};

function Field({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-2">
      <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
function Area({ label, value, onChange, rows = 3 }: any) {
  return (
    <div className="space-y-2">
      <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</Label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} />
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-border/50 py-2">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{k}</span>
      <span className="text-foreground">{v}</span>
    </div>
  );
}