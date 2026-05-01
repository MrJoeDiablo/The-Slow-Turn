import { useMemo } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatTile } from "@/components/app/StatTile";
import { EmptyState } from "@/components/app/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Activity, Briefcase, Radio, ArrowUpRight, ArrowDownRight, ShieldAlert } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip } from "recharts";
import { useExchangeAccounts, useTrades, usePositions, useStrategySignals, usePortfolioSnapshots } from "@/hooks/useTrading";
import { PaperTradeDialog } from "@/components/trading/PaperTradeDialog";
import { AddExchangeDialog } from "@/components/trading/AddExchangeDialog";
import { formatDistanceToNow } from "date-fns";

function fmtMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
}

export default function Trading() {
  const { data: accounts, loading: accLoading } = useExchangeAccounts();
  const { data: trades } = useTrades(50);
  const { data: positions } = usePositions();
  const { data: signals } = useStrategySignals(20);
  const { data: snapshots } = usePortfolioSnapshots(accounts[0]?.id);

  const totalPositionValue = useMemo(
    () => positions.reduce((s, p) => s + Number(p.qty) * Number(p.avg_price), 0),
    [positions]
  );
  const totalUnrealized = useMemo(
    () => positions.reduce((s, p) => s + Number(p.unrealized_pnl), 0),
    [positions]
  );
  const trades24h = useMemo(() => {
    const cutoff = Date.now() - 24 * 3600_000;
    return trades.filter((t) => new Date(t.executed_at).getTime() > cutoff).length;
  }, [trades]);

  // Synthesize a sparkline from snapshots; if none, derive from trades.
  const chartData = useMemo(() => {
    if (snapshots.length > 1) return snapshots.map((s) => ({ t: new Date(s.snapshot_at).getTime(), v: Number(s.total_value) }));
    // fallback: cumulative notional from trades
    let acc = 0;
    return trades.slice().reverse().map((t) => {
      acc += (t.side === "buy" ? 1 : -1) * Number(t.qty) * Number(t.price);
      return { t: new Date(t.executed_at).getTime(), v: acc };
    });
  }, [snapshots, trades]);

  return (
    <div className="container py-6 sm:py-10 animate-fade-up">
      <PageHeader
        eyebrow="Axiom · Crypto Desk"
        title="Trading"
        subtitle="Paper-first. Live capital is gated behind keys, role checks, and risk limits."
        actions={
          <div className="flex gap-2">
            <AddExchangeDialog />
            <PaperTradeDialog accounts={accounts} />
          </div>
        }
      />

      {/* Hero stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatTile label="Notional held" value={fmtMoney(totalPositionValue)} hint="Sum of qty × avg price" />
        <StatTile
          label="Unrealized P&L"
          value={fmtMoney(totalUnrealized)}
          tone={totalUnrealized >= 0 ? "primary" : "destructive"}
          hint="Across all open positions"
        />
        <StatTile label="Trades · 24h" value={trades24h} hint={`${trades.length} total tracked`} />
        <StatTile label="Accounts" value={accounts.length} tone={accounts.length ? "default" : "warning"} hint={`${accounts.filter(a => a.mode === "live").length} live`} />
      </div>

      {/* Equity curve */}
      <div className="panel p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="eyebrow">Equity curve</p>
            <p className="text-sm text-muted-foreground mt-1">
              {snapshots.length > 1 ? "From portfolio snapshots" : "Estimated from recent trade flow (paper)"}
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-[0.15em]">
            <Radio className="mr-1 h-3 w-3 text-primary animate-pulse-dot" /> Live
          </Badge>
        </div>
        {chartData.length > 1 ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" tickFormatter={(t) => new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => fmtMoney(v).replace(".00", "")} />
                <RTooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", fontSize: 12, borderRadius: 8 }}
                  labelFormatter={(t: number) => new Date(t).toLocaleString()}
                  formatter={(v: number) => fmtMoney(v)}
                />
                <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#eq)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-12">
            No data yet — place a paper trade to seed the curve.
          </p>
        )}
      </div>

      {/* Tabs: Positions / Trades / Signals / Accounts */}
      <Tabs defaultValue="positions">
        <TabsList className="grid grid-cols-4 w-full max-w-xl mb-4">
          <TabsTrigger value="positions"><Briefcase className="mr-1.5 h-3.5 w-3.5" />Positions</TabsTrigger>
          <TabsTrigger value="trades"><Activity className="mr-1.5 h-3.5 w-3.5" />Trades</TabsTrigger>
          <TabsTrigger value="signals"><Radio className="mr-1.5 h-3.5 w-3.5" />Signals</TabsTrigger>
          <TabsTrigger value="accounts"><ShieldAlert className="mr-1.5 h-3.5 w-3.5" />Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="positions">
          <Card className="panel overflow-hidden">
            {positions.length === 0 ? (
              <EmptyState title="No open positions" body="Positions appear here as agents accumulate exposure." />
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
                  <tr><th className="text-left p-3">Symbol</th><th className="text-right p-3">Qty</th><th className="text-right p-3">Avg price</th><th className="text-right p-3">Notional</th><th className="text-right p-3">Unrealized</th></tr>
                </thead>
                <tbody>
                  {positions.map((p) => {
                    const notional = Number(p.qty) * Number(p.avg_price);
                    const pnl = Number(p.unrealized_pnl);
                    return (
                      <tr key={p.id} className="border-t border-border">
                        <td className="p-3 font-mono">{p.symbol}</td>
                        <td className="p-3 text-right font-mono">{Number(p.qty).toFixed(4)}</td>
                        <td className="p-3 text-right font-mono">{fmtMoney(Number(p.avg_price))}</td>
                        <td className="p-3 text-right font-mono">{fmtMoney(notional)}</td>
                        <td className={`p-3 text-right font-mono ${pnl >= 0 ? "text-success" : "text-destructive"}`}>
                          {pnl >= 0 ? "+" : ""}{fmtMoney(pnl)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="trades">
          <Card className="panel overflow-hidden">
            {trades.length === 0 ? (
              <EmptyState title="No trades yet" body="Place a paper trade or wait for an agent strategy to fire." />
            ) : (
              <div className="max-h-[480px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground sticky top-0">
                    <tr><th className="text-left p-3">When</th><th className="text-left p-3">Symbol</th><th className="text-left p-3">Side</th><th className="text-right p-3">Qty</th><th className="text-right p-3">Price</th><th className="text-right p-3">Notional</th></tr>
                  </thead>
                  <tbody>
                    {trades.map((t) => (
                      <tr key={t.id} className="border-t border-border">
                        <td className="p-3 text-muted-foreground text-xs">{formatDistanceToNow(new Date(t.executed_at), { addSuffix: true })}</td>
                        <td className="p-3 font-mono">{t.symbol}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider ${t.side === "buy" ? "text-success" : "text-destructive"}`}>
                            {t.side === "buy" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {t.side}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono">{Number(t.qty).toFixed(4)}</td>
                        <td className="p-3 text-right font-mono">{fmtMoney(Number(t.price))}</td>
                        <td className="p-3 text-right font-mono">{fmtMoney(Number(t.qty) * Number(t.price))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="signals">
          <Card className="panel overflow-hidden">
            {signals.length === 0 ? (
              <EmptyState title="No agent signals" body="Strategy signals from Axiom and other agents will appear here in real time." />
            ) : (
              <ul className="divide-y divide-border">
                {signals.map((s) => (
                  <li key={s.id} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-sm">
                        <span className="text-primary">{s.symbol}</span> · {s.signal}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {s.confidence != null && (
                      <Badge variant="outline" className="font-mono text-[10px]">
                        conf {(Number(s.confidence) * 100).toFixed(0)}%
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="accounts">
          <Card className="panel overflow-hidden">
            {accLoading ? (
              <div className="p-10 text-center text-muted-foreground text-sm">Loading…</div>
            ) : accounts.length === 0 ? (
              <EmptyState title="No exchange accounts" body="Add a paper account to start. Live accounts require API keys + admin approval." />
            ) : (
              <ul className="divide-y divide-border">
                {accounts.map((a) => (
                  <li key={a.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{a.label}</p>
                      <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-0.5">
                        {a.exchange} · added {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge variant={a.mode === "live" ? "default" : "outline"} className="font-mono text-[10px] uppercase tracking-[0.15em]">
                      {a.mode}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <p className="text-center text-[11px] text-muted-foreground mt-6 font-mono uppercase tracking-wider">
        Not financial advice · {accounts.some((a) => a.mode === "live") ? "live mode active on some accounts" : "paper trading mode"}
      </p>
    </div>
  );
}