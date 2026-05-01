import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Eye, EyeOff, Copy, Pencil, Trash2, Lock, Search, ExternalLink } from "lucide-react";

interface Cred {
  id: string;
  label: string;
  username: string | null;
  url: string | null;
  notes: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

const empty = { label: "", username: "", url: "", notes: "", category: "general", secret: "" };

export default function Vault() {
  const { roles } = useAuth();
  const isAdmin = roles.includes("admin") || roles.includes("owner");
  const [items, setItems] = useState<Cred[]>([]);
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("");
  const [edit, setEdit] = useState<(typeof empty & { id?: string }) | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("vault-locker", { body: { action: "list" } });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error ?? "Load failed");
      setItems(data.items ?? []);
    } catch (e: any) {
      toast.error(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const reveal = async (id: string) => {
    if (revealed[id]) {
      setRevealed((r) => { const n = { ...r }; delete n[id]; return n; });
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("vault-locker", {
        body: { action: "reveal", id },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error ?? "Reveal failed");
      setRevealed((r) => ({ ...r, [id]: data.secret }));
    } catch (e: any) {
      toast.error(e?.message ?? String(e));
    }
  };

  const copySecret = async (id: string) => {
    try {
      let secret = revealed[id];
      if (!secret) {
        const { data, error } = await supabase.functions.invoke("vault-locker", {
          body: { action: "reveal", id },
        });
        if (error) throw error;
        if (!data?.ok) throw new Error(data?.error ?? "Reveal failed");
        secret = data.secret;
      }
      await navigator.clipboard.writeText(secret);
      toast.success("Password copied to clipboard");
    } catch (e: any) {
      toast.error(e?.message ?? String(e));
    }
  };

  const copyText = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const startNew = () => { setEdit({ ...empty }); setOpen(true); };
  const startEdit = (c: Cred) => {
    setEdit({
      id: c.id,
      label: c.label,
      username: c.username ?? "",
      url: c.url ?? "",
      notes: c.notes ?? "",
      category: c.category ?? "general",
      secret: "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!edit?.label) { toast.error("Label required"); return; }
    if (!edit.id && !edit.secret) { toast.error("Password required for new entries"); return; }
    try {
      const action = edit.id ? "update" : "create";
      const body: any = {
        action,
        id: edit.id,
        label: edit.label,
        username: edit.username || null,
        url: edit.url || null,
        notes: edit.notes || null,
        category: edit.category || "general",
      };
      if (edit.secret) body.secret = edit.secret;
      const { data, error } = await supabase.functions.invoke("vault-locker", { body });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error ?? "Save failed");
      toast.success(edit.id ? "Updated" : "Created");
      setOpen(false);
      setEdit(null);
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? String(e));
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this credential?")) return;
    try {
      const { data, error } = await supabase.functions.invoke("vault-locker", {
        body: { action: "delete", id },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error ?? "Delete failed");
      toast.success("Deleted");
      setRevealed((r) => { const n = { ...r }; delete n[id]; return n; });
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? String(e));
    }
  };

  const filtered = items.filter((c) => {
    if (!filter) return true;
    const f = filter.toLowerCase();
    return (
      c.label.toLowerCase().includes(f) ||
      (c.username ?? "").toLowerCase().includes(f) ||
      (c.url ?? "").toLowerCase().includes(f) ||
      (c.category ?? "").toLowerCase().includes(f)
    );
  });

  return (
    <div className="container py-6 sm:py-10 animate-fade-up">
      <PageHeader
        eyebrow="Password locker"
        title="Vault"
        subtitle="Encrypted credential store. One source of truth — no more scattered passwords."
        actions={isAdmin && (
          <Button onClick={startNew} className="gap-2">
            <Plus className="h-4 w-4" /> New credential
          </Button>
        )}
      />

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search by label, user, url…"
            className="pl-9"
          />
        </div>
        <Badge variant="outline" className="gap-1">
          <Lock className="h-3 w-3" />
          {items.length} entries
        </Badge>
      </div>

      <div className="panel">
        {loading ? (
          <p className="text-xs text-muted-foreground text-center py-12">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-12">
            {items.length === 0 ? "Empty. Add your first credential." : "No matches."}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((c) => {
              const isOpen = !!revealed[c.id];
              return (
                <li key={c.id} className="p-4 group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-medium text-sm">{c.label}</h3>
                        {c.category && <Badge variant="secondary" className="text-[10px]">{c.category}</Badge>}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        {c.username && (
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-muted-foreground shrink-0">user:</span>
                            <code className="font-mono truncate">{c.username}</code>
                            <button onClick={() => copyText(c.username!, "Username")} className="opacity-50 hover:opacity-100">
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        {c.url && (
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-muted-foreground shrink-0">url:</span>
                            <a href={c.url} target="_blank" rel="noreferrer" className="font-mono truncate hover:text-primary flex items-center gap-1 min-w-0">
                              <span className="truncate">{c.url}</span>
                              <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 text-xs">
                        <span className="text-muted-foreground shrink-0">pass:</span>
                        <code className="font-mono px-2 py-0.5 rounded bg-muted/40 select-all min-w-0 truncate max-w-md">
                          {isOpen ? revealed[c.id] : "••••••••••••"}
                        </code>
                        <button onClick={() => reveal(c.id)} className="opacity-50 hover:opacity-100" title={isOpen ? "Hide" : "Reveal"}>
                          {isOpen ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </button>
                        <button onClick={() => copySecret(c.id)} className="opacity-50 hover:opacity-100" title="Copy password">
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      {c.notes && (
                        <p className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">{c.notes}</p>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100">
                        <button onClick={() => startEdit(c)} className="p-1 hover:text-primary" aria-label="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => remove(c.id)} className="p-1 hover:text-destructive" aria-label="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEdit(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{edit?.id ? "Edit credential" : "New credential"}</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="space-y-3">
              <div>
                <Label>Label *</Label>
                <Input value={edit.label} onChange={(e) => setEdit({ ...edit, label: e.target.value })} placeholder="SiteGround admin" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Username / email</Label>
                  <Input value={edit.username} onChange={(e) => setEdit({ ...edit, username: e.target.value })} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>URL</Label>
                <Input value={edit.url} onChange={(e) => setEdit({ ...edit, url: e.target.value })} placeholder="https://" />
              </div>
              <div>
                <Label>Password {edit.id && <span className="text-muted-foreground text-xs">(leave blank to keep current)</span>}</Label>
                <Input
                  type="password"
                  value={edit.secret}
                  onChange={(e) => setEdit({ ...edit, secret: e.target.value })}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={edit.notes} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} rows={3} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
