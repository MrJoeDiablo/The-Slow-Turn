import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import * as Icons from "lucide-react";
import { Plus, ExternalLink, Pencil, Trash2 } from "lucide-react";

interface Link {
  id: string;
  label: string;
  url: string;
  icon: string | null;
  category: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

const empty: Partial<Link> = { label: "", url: "", icon: "Link", category: "general", description: "", sort_order: 100, is_active: true };

function IconFor({ name, className }: { name?: string | null; className?: string }) {
  const Cmp: any = name && (Icons as any)[name] ? (Icons as any)[name] : Icons.Link;
  return <Cmp className={className} />;
}

export default function Links() {
  const { roles } = useAuth();
  const isAdmin = roles.includes("admin") || roles.includes("owner");
  const [links, setLinks] = useState<Link[]>([]);
  const [edit, setEdit] = useState<Partial<Link> | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("quick_links")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("label", { ascending: true });
    setLinks((data ?? []) as Link[]);
  };

  useEffect(() => { load(); }, []);

  const startNew = () => { setEdit({ ...empty }); setOpen(true); };
  const startEdit = (l: Link) => { setEdit(l); setOpen(true); };

  const save = async () => {
    if (!edit?.label || !edit?.url) {
      toast.error("Label and URL required");
      return;
    }
    try { new URL(edit.url); } catch { toast.error("Invalid URL"); return; }

    const payload = {
      label: edit.label,
      url: edit.url,
      icon: edit.icon || null,
      category: edit.category || "general",
      description: edit.description || null,
      sort_order: edit.sort_order ?? 100,
      is_active: edit.is_active ?? true,
    };

    if (edit.id) {
      const { error } = await supabase.from("quick_links").update(payload).eq("id", edit.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Updated");
    } else {
      const { error } = await supabase.from("quick_links").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Created");
    }
    setOpen(false);
    setEdit(null);
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this link?")) return;
    const { error } = await supabase.from("quick_links").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    await load();
  };

  const grouped = links.reduce<Record<string, Link[]>>((acc, l) => {
    const k = l.category || "general";
    (acc[k] ||= []).push(l);
    return acc;
  }, {});

  const categoryOrder = ["infra", "code", "sites", "ai", "general"];
  const categoryLabels: Record<string, string> = {
    infra: "Infrastructure",
    code: "Code",
    sites: "Sites",
    ai: "AI / APIs",
    general: "General",
  };
  const cats = Object.keys(grouped).sort((a, b) => {
    const ia = categoryOrder.indexOf(a); const ib = categoryOrder.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  return (
    <div className="container py-6 sm:py-10 animate-fade-up">
      <PageHeader
        eyebrow="Quick links"
        title="Mission links"
        subtitle="One-click access to the consoles, repos, and dashboards we use every day."
        actions={isAdmin && (
          <Button onClick={startNew} className="gap-2">
            <Plus className="h-4 w-4" /> New link
          </Button>
        )}
      />

      {cats.length === 0 ? (
        <p className="text-sm text-muted-foreground">No links yet.</p>
      ) : (
        <div className="space-y-8">
          {cats.map((cat) => (
            <section key={cat}>
              <h2 className="eyebrow mb-3">{categoryLabels[cat] ?? cat}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {grouped[cat].map((l) => (
                  <div key={l.id} className="panel p-4 group flex items-start gap-3 hover:border-primary/50 transition-colors">
                    <div className="rounded-md bg-primary/10 text-primary p-2 shrink-0">
                      <IconFor name={l.icon} className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-sm hover:text-primary flex items-center gap-1.5 truncate"
                      >
                        {l.label}
                        <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                      </a>
                      {l.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{l.description}</p>
                      )}
                      <p className="text-[10px] font-mono text-muted-foreground/70 mt-1 truncate">{l.url}</p>
                    </div>
                    {isAdmin && (
                      <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-1">
                        <button onClick={() => startEdit(l)} className="p-1 hover:text-primary" aria-label="Edit">
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button onClick={() => remove(l.id)} className="p-1 hover:text-destructive" aria-label="Delete">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEdit(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{edit?.id ? "Edit link" : "New link"}</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="space-y-3">
              <div>
                <Label>Label</Label>
                <Input value={edit.label ?? ""} onChange={(e) => setEdit({ ...edit, label: e.target.value })} />
              </div>
              <div>
                <Label>URL</Label>
                <Input value={edit.url ?? ""} onChange={(e) => setEdit({ ...edit, url: e.target.value })} placeholder="https://" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Icon (lucide name)</Label>
                  <Input value={edit.icon ?? ""} onChange={(e) => setEdit({ ...edit, icon: e.target.value })} placeholder="Github" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input value={edit.category ?? ""} onChange={(e) => setEdit({ ...edit, category: e.target.value })} placeholder="infra" />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={edit.description ?? ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Sort order</Label>
                <Input type="number" value={edit.sort_order ?? 100} onChange={(e) => setEdit({ ...edit, sort_order: Number(e.target.value) })} />
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
