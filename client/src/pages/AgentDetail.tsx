import { useParams, Link, useNavigate } from "react-router-dom";
import { useAgent } from "@/hooks/useAgents";
import { PageHeader } from "@/components/app/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Pause, Play, ArrowLeft, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useHasMinRole } from "@/hooks/useAuth";
import { EmptyState } from "@/components/app/EmptyState";

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: agent, refetch } = useAgent(id);
  const navigate = useNavigate();
  const canEdit = useHasMinRole("admin");
  const canOperate = useHasMinRole("operator");

  const [todos, setTodos] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [memoryNotes, setMemoryNotes] = useState("");
  const [newTodo, setNewTodo] = useState("");
  const [pricing, setPricing] = useState<any[]>([]);
  const [todaySpend, setTodaySpend] = useState<number>(0);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [t, k, l] = await Promise.all([
        supabase.from("agent_todos").select("*").eq("agent_id", id).order("position"),
        supabase.from("agent_tasks").select("*").eq("agent_id", id).order("created_at", { ascending: false }),
        supabase.from("agent_logs").select("*").eq("agent_id", id).order("created_at", { ascending: false }).limit(30),
      ]);
      setTodos(t.data ?? []);
      setTasks(k.data ?? []);
      setLogs(l.data ?? []);
      const { data: pr } = await supabase.from("model_pricing").select("*").order("provider").order("model");
      setPricing(pr ?? []);
      const today = new Date().toISOString().slice(0, 10);
      const { data: sp } = await supabase.from("spend_daily").select("cost_usd").eq("agent_id", id).eq("date", today).maybeSingle();
      setTodaySpend(Number(sp?.cost_usd ?? 0));
    })();
  }, [id]);

  useEffect(() => {
    if (agent) setMemoryNotes((agent.memory as any)?.notes ?? "");
  }, [agent]);

  if (!agent) return <div className="container py-10 text-sm text-muted-foreground">Loading agent…</div>;

  const initials = agent.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  async function togglePause() {
    if (!agent) return;
    const { error } = await supabase.from("agents").update({ is_paused: !agent.is_paused }).eq("id", agent.id);
    if (error) return toast.error(error.message);
    toast.success(agent.is_paused ? "Resumed" : "Paused");
    refetch();
  }

  async function addTodo() {
    if (!newTodo.trim() || !id) return;
    const { data, error } = await supabase.from("agent_todos").insert({ agent_id: id, label: newTodo.trim(), position: todos.length }).select().single();
    if (error) return toast.error(error.message);
    setTodos([...todos, data]);
    setNewTodo("");
  }

  async function toggleTodo(t: any) {
    const { error } = await supabase.from("agent_todos").update({ done: !t.done }).eq("id", t.id);
    if (!error) setTodos(todos.map((x) => x.id === t.id ? { ...x, done: !x.done } : x));
  }

  async function saveMemory() {
    const { error } = await supabase.from("agents").update({ memory: { ...(agent.memory as any), notes: memoryNotes } }).eq("id", agent.id);
    if (error) return toast.error(error.message);
    toast.success("Memory saved.");
  }

  async function saveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const updates = {
      name: fd.get("name") as string,
      role_title: fd.get("role_title") as string,
      model: fd.get("model") as string,
      provider: fd.get("provider") as string,
      avatar_url: (fd.get("avatar_url") as string) || null,
      system_instructions: (fd.get("system_instructions") as string) || null,
      daily_cost_cap_usd: Number(fd.get("daily_cost_cap_usd") ?? 5),
      monthly_cost_cap_usd: Number(fd.get("monthly_cost_cap_usd") ?? 100),
    };
    const { error } = await supabase.from("agents").update(updates).eq("id", agent.id);
    if (error) return toast.error(error.message);
    toast.success("Saved.");
    refetch();
  }

  return (
    <div className="container py-6 sm:py-10 animate-fade-up">
      <Button variant="ghost" size="sm" onClick={() => navigate("/app/agents")} className="mb-4 font-mono text-[10px] uppercase tracking-wider">
        <ArrowLeft size={14} className="mr-1.5" /> All agents
      </Button>

      <div className="panel p-6 mb-6 flex flex-col sm:flex-row gap-5 items-start">
        <Avatar className="h-20 w-20 border border-border">
          <AvatarImage src={agent.avatar_url ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-primary font-mono text-xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            <StatusBadge status={agent.status as any} />
            {agent.is_paused && <span className="font-mono text-[10px] uppercase tracking-wider text-warning">Paused</span>}
          </div>
          <p className="font-mono text-xs text-primary mt-1">{agent.role_title}</p>
          {agent.description && <p className="text-sm text-muted-foreground mt-3">{agent.description}</p>}
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-3">
            {agent.provider}/{agent.model}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="font-mono text-[10px] uppercase tracking-wider">
            <Link to={`/app/chat/${agent.id}`}><MessageSquare size={13} className="mr-1.5" /> Chat</Link>
          </Button>
          {canOperate && (
            <Button onClick={togglePause} variant="outline" size="sm" className="font-mono text-[10px] uppercase tracking-wider">
              {agent.is_paused ? <><Play size={13} className="mr-1.5" /> Resume</> : <><Pause size={13} className="mr-1.5" /> Pause</>}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap h-auto">
          {["overview", "tasks", "memory", "tools", "history", "files", "logs", "settings"].map((t) => (
            <TabsTrigger key={t} value={t} className="font-mono text-[10px] uppercase tracking-wider">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="panel p-5">
              <p className="eyebrow mb-2">Current task</p>
              <p className="text-sm">{agent.current_task ?? "—"}</p>
            </div>
            <div className="panel p-5">
              <p className="eyebrow mb-2">To-dos</p>
              <p className="text-sm">{todos.filter((t) => !t.done).length} open · {todos.filter((t) => t.done).length} done</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6 space-y-4">
          <div className="panel p-5">
            <h3 className="eyebrow mb-3">Active to-dos</h3>
            <ul className="space-y-2 mb-4">
              {todos.length === 0 && <li className="text-sm text-muted-foreground">No to-dos yet.</li>}
              {todos.map((t) => (
                <li key={t.id} className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={t.done} onChange={() => toggleTodo(t)} disabled={!canOperate} className="accent-primary" />
                  <span className={t.done ? "line-through text-muted-foreground" : ""}>{t.label}</span>
                </li>
              ))}
            </ul>
            {canOperate && (
              <div className="flex gap-2">
                <Input value={newTodo} onChange={(e) => setNewTodo(e.target.value)} placeholder="Add to-do…" onKeyDown={(e) => e.key === "Enter" && addTodo()} />
                <Button onClick={addTodo} size="sm">Add</Button>
              </div>
            )}
          </div>

          <div className="panel p-5">
            <h3 className="eyebrow mb-3">Tasks</h3>
            {tasks.length === 0 ? <p className="text-sm text-muted-foreground">No tasks assigned.</p> : (
              <ul className="space-y-2">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-center justify-between text-sm border-b border-border/50 pb-2">
                    <span>{t.title}</span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{t.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        <TabsContent value="memory" className="mt-6">
          <div className="panel p-5 space-y-3">
            <Label className="eyebrow">Notes / context</Label>
            <Textarea rows={10} value={memoryNotes} onChange={(e) => setMemoryNotes(e.target.value)} disabled={!canEdit} />
            {canEdit && <Button onClick={saveMemory}>Save memory</Button>}
          </div>
        </TabsContent>

        <TabsContent value="tools" className="mt-6">
          <EmptyState title="Tool grants" body="Connect tools and grant per-agent permissions. Wired to agent_permissions table." />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="panel p-5">
            {tasks.filter((t) => t.status === "done").length === 0 ? (
              <p className="text-sm text-muted-foreground">No completed work yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {tasks.filter((t) => t.status === "done").map((t) => (
                  <li key={t.id} className="flex justify-between border-b border-border/50 pb-2">
                    <span>{t.title}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{new Date(t.completed_at ?? t.updated_at).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <EmptyState title="No artifacts yet" body="Files this agent produces will appear here once the artifact pipeline is connected." />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <div className="panel p-5">
            {logs.length === 0 ? <p className="text-sm text-muted-foreground">No logs.</p> : (
              <ul className="space-y-2 font-mono text-xs">
                {logs.map((l) => (
                  <li key={l.id} className="flex gap-3">
                    <span className="text-muted-foreground">{new Date(l.created_at).toLocaleTimeString()}</span>
                    <span className={l.level === "error" ? "text-destructive" : l.level === "warn" ? "text-warning" : "text-foreground/80"}>{l.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          {!canEdit ? (
            <EmptyState title="Admin access required" body="Only admins and owners can edit agent settings." />
          ) : (
            <form onSubmit={saveSettings} className="panel p-5 space-y-4 max-w-xl">
              <Field name="name" label="Name" defaultValue={agent.name} />
              <Field name="role_title" label="Role title" defaultValue={agent.role_title} />
              <Field name="avatar_url" label="Avatar URL" defaultValue={agent.avatar_url ?? ""} />
              <div className="grid grid-cols-2 gap-3">
                <Field name="provider" label="Provider" defaultValue={agent.provider ?? ""} />
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Model</Label>
                  <select name="model" defaultValue={agent.model ?? ""} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">(use gateway default)</option>
                    {pricing.map((m) => (<option key={m.id} value={m.model}>{m.provider} / {m.model}</option>))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field name="daily_cost_cap_usd" label={`Daily cap USD (today: $${todaySpend.toFixed(4)})`} defaultValue={String(agent.daily_cost_cap_usd ?? 5)} />
                <Field name="monthly_cost_cap_usd" label="Monthly cap USD" defaultValue={String(agent.monthly_cost_cap_usd ?? 100)} />
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">System instructions</Label>
                <Textarea name="system_instructions" rows={6} defaultValue={agent.system_instructions ?? ""} />
              </div>
              <Button type="submit">Save changes</Button>
            </form>
          )}
        </TabsContent>
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