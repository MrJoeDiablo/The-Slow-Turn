import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowDownUp } from "lucide-react";
import type { ExchangeAccount } from "@/hooks/useTrading";

export function PaperTradeDialog({ accounts }: { accounts: ExchangeAccount[] }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id ?? "");
  const [symbol, setSymbol] = useState("BTC/USDT");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [qty, setQty] = useState("0.01");
  const [price, setPrice] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountId) return toast.error("Pick an exchange account first.");
    setBusy(true);
    // Insert paper trade directly. Live trades will route through exchange-proxy.
    const numericPrice = price ? Number(price) : 50000 + Math.random() * 5000;
    const { error } = await supabase.from("trades").insert({
      exchange_account_id: accountId,
      symbol,
      side,
      qty: Number(qty),
      price: numericPrice,
      status: "filled",
      metadata: { mode: "paper", source: "console" },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`${side.toUpperCase()} ${qty} ${symbol} @ ${numericPrice.toFixed(2)} (paper)`);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="font-mono text-xs uppercase tracking-[0.15em]">
          <ArrowDownUp className="mr-2 h-3.5 w-3.5" /> New paper trade
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Place paper trade</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Exchange account</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger><SelectValue placeholder="Choose account" /></SelectTrigger>
              <SelectContent>
                {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.label} · {a.exchange} · {a.mode}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Symbol</Label>
              <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} required />
            </div>
            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Side</Label>
              <Select value={side} onValueChange={(v: "buy" | "sell") => setSide(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Qty</Label>
              <Input type="number" step="0.0001" value={qty} onChange={(e) => setQty(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Price (blank = market)</Label>
              <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="market" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy} className="font-mono text-xs uppercase tracking-[0.15em] w-full">
              {busy ? <Loader2 className="animate-spin" /> : "Submit paper order →"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
