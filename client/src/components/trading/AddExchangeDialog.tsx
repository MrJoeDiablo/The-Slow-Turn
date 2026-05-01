import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

export function AddExchangeDialog() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [label, setLabel] = useState("Axiom · Paper");
  const [exchange, setExchange] = useState<"bitmart" | "binance" | "coinbase" | "kraken" | "other">("bitmart");
  const [mode, setMode] = useState<"paper" | "live">("paper");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("exchange_accounts").insert({
      label, exchange, mode, is_active: true, created_by: u.user?.id,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Exchange account added.");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="font-mono text-xs uppercase tracking-[0.15em]">
          <Plus className="mr-1 h-3.5 w-3.5" /> Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add exchange account</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Exchange</Label>
              <Select value={exchange} onValueChange={(v: any) => setExchange(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bitmart">BitMart</SelectItem>
                  <SelectItem value="binance">Binance</SelectItem>
                  <SelectItem value="coinbase">Coinbase</SelectItem>
                  <SelectItem value="kraken">Kraken</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Mode</Label>
              <Select value={mode} onValueChange={(v: any) => setMode(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paper">Paper</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            API keys are added later via <span className="font-mono">Settings → Integrations</span>. Live mode is gated until keys + risk limits are confirmed.
          </p>
          <DialogFooter>
            <Button type="submit" disabled={busy} className="font-mono text-xs uppercase tracking-[0.15em] w-full">
              {busy ? <Loader2 className="animate-spin" /> : "Add account →"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
