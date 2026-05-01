import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAgents } from "@/hooks/useAgents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth, useHasMinRole } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Send, Loader2, Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";

type Room = { id: string; agent_id: string; title: string; archived_at: string | null; created_at: string };

export default function Chat() {
  const { agentId } = useParams<{ agentId?: string }>();
  const nav = useNavigate();
  const { data: agents = [] } = useAgents();
  const { user } = useAuth();
  const canSend = useHasMinRole("operator");
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = agents.find((a) => a.id === agentId) ?? agents[0];
  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? null;

  useEffect(() => {
    if (!agentId && agents[0]) nav(`/app/chat/${agents[0].id}`, { replace: true });
  }, [agents, agentId, nav]);

  // Load rooms whenever the active agent changes
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("agent_rooms")
        .select("*")
        .eq("agent_id", active.id)
        .is("archived_at", null)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      const list = (data ?? []) as Room[];
      setRooms(list);
      // Select the most recently created room by default
      setActiveRoomId(list.length ? list[list.length - 1].id : null);
    })();
    return () => { cancelled = true; };
  }, [active?.id]);

  // Load messages for the active room + subscribe to live changes
  useEffect(() => {
    if (!active || !activeRoomId) { setMessages([]); return; }
    (async () => {
      const { data } = await supabase
        .from("agent_messages")
        .select("*")
        .eq("agent_id", active.id)
        .eq("room_id", activeRoomId)
        .order("created_at")
        .limit(200);
      setMessages(data ?? []);
    })();
    const ch = supabase.channel(`chat-${active.id}-${activeRoomId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "agent_messages", filter: `room_id=eq.${activeRoomId}` },
          (p) => setMessages((m) => [...m, p.new]))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "agent_messages", filter: `room_id=eq.${activeRoomId}` },
          (p) => setMessages((m) => m.map((x) => x.id === (p.new as any).id ? p.new : x)))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [active?.id, activeRoomId]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [messages]);

  async function send() {
    if (!input.trim() || !active || !user) return;
    setBusy(true);
    const content = input.trim();
    setInput("");
    try {
      const { data, error } = await supabase.functions.invoke("openclaw-send", {
        body: { agent_id: active.id, content, room_id: activeRoomId ?? undefined },
      });
      if (error) toast.error(error.message);
      else if ((data as any)?.error) toast.error((data as any).error);
      else if ((data as any)?.capped) toast.warning("Daily cost cap reached for this agent.");
      else if ((data as any)?.room_id && !activeRoomId) {
        setActiveRoomId((data as any).room_id);
      }
    } finally {
      setBusy(false);
    }
  }

  async function createRoom() {
    if (!active || !user) return;
    const title = window.prompt("Conversation title", "New conversation");
    if (!title || !title.trim()) return;
    const { data, error } = await supabase
      .from("agent_rooms")
      .insert({ agent_id: active.id, title: title.trim(), created_by: user.id })
      .select("*").single();
    if (error) return toast.error(error.message);
    setRooms((r) => [...r, data as Room]);
    setActiveRoomId((data as Room).id);
  }

  async function resetSession() {
    if (!active || !activeRoomId) return;
    if (!window.confirm("Start a fresh conversation? The agent will forget everything in this room.")) return;
    const { error } = await supabase.functions.invoke("openclaw-reset-session", {
      body: { agent_id: active.id, room_id: activeRoomId },
    });
    if (error) toast.error(error.message);
    else toast.success("Memory cleared. Next message starts a new session.");
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem-4rem)] md:h-[calc(100vh-3.5rem)] animate-fade-up">
      <aside className="hidden md:flex w-64 border-r border-border flex-col">
        <div className="px-4 py-3 border-b border-border eyebrow">Agents</div>
        <div className="flex-1 overflow-y-auto">
          {agents.map((a) => (
            <button key={a.id} onClick={() => nav(`/app/chat/${a.id}`)}
              className={cn("w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-card transition-colors border-b border-border/50",
                active?.id === a.id && "bg-primary/5 border-l-2 border-l-primary")}>
              <Avatar className="h-8 w-8"><AvatarImage src={a.avatar_url ?? undefined} /><AvatarFallback className="text-[10px] bg-primary/10 text-primary">{a.name.slice(0,2)}</AvatarFallback></Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{a.name}</p>
                <p className="text-[10px] font-mono text-muted-foreground truncate">{a.role_title}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        {active && (
          <>
            <div className="px-4 py-3 border-b border-border flex items-center gap-3">
              <Avatar className="h-9 w-9"><AvatarImage src={active.avatar_url ?? undefined} /><AvatarFallback className="text-xs bg-primary/10 text-primary">{active.name.slice(0,2)}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{active.name}</p>
                <p className="text-[10px] font-mono text-muted-foreground truncate">{active.provider}/{active.model}</p>
              </div>
              {activeRoom && canSend && (
                <button
                  onClick={resetSession}
                  title="Start a fresh conversation (clears agent memory)"
                  className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary flex items-center gap-1">
                  <RotateCcw size={11} /> Reset
                </button>
              )}
              <Link to={`/app/agents/${active.id}`} className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary">Settings →</Link>
            </div>
            {/* Rooms strip */}
            <div className="px-2 py-2 border-b border-border flex items-center gap-1 overflow-x-auto">
              {rooms.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setActiveRoomId(r.id)}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-colors",
                    activeRoomId === r.id
                      ? "bg-primary/15 text-foreground border border-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-card border border-transparent"
                  )}>
                  {r.title}
                </button>
              ))}
              {canSend && (
                <button
                  onClick={createRoom}
                  title="New conversation thread"
                  className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-primary hover:bg-card flex items-center gap-1">
                  <Plus size={12} /> New
                </button>
              )}
            </div>
          </>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && <p className="text-center text-sm text-muted-foreground mt-10">Send a message to start the conversation.</p>}
          {messages.map((m) => (
            <div key={m.id} className={cn("flex", m.sender_type === "user" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[80%] rounded-lg px-3 py-2 text-sm",
                m.sender_type === "user" ? "bg-primary/15 border border-primary/30 text-foreground" :
                m.status === "error" ? "bg-destructive/10 border border-destructive/30" :
                m.status === "capped" ? "bg-warning/10 border border-warning/30" :
                "bg-card border border-border")}>
                {m.status === "queued" ? (
                  <p className="flex items-center gap-2 text-muted-foreground"><Loader2 size={14} className="animate-spin" /> thinking…</p>
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
                {(m.model || m.cost_usd != null) && m.status !== "queued" && (
                  <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground mt-1">
                    {m.model}
                    {m.tokens_in != null && ` · ${m.tokens_in}+${m.tokens_out ?? 0}t`}
                    {m.cost_usd != null && ` · $${Number(m.cost_usd).toFixed(4)}`}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border p-3 flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={canSend ? `Message ${active?.name ?? "agent"}…` : "Operator role required"}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())} disabled={!canSend || busy} />
          <Button onClick={send} disabled={!canSend || busy || !input.trim()}><Send size={16} /></Button>
        </div>
      </div>
    </div>
  );
}
