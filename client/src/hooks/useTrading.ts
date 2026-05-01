import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ExchangeAccount = {
  id: string;
  label: string;
  exchange: string;
  mode: "paper" | "live";
  is_active: boolean;
  created_at: string;
};

export type Trade = {
  id: string;
  exchange_account_id: string;
  symbol: string;
  side: string;
  qty: number;
  price: number;
  status: string;
  executed_at: string;
  metadata: any;
};

export type Position = {
  id: string;
  exchange_account_id: string;
  symbol: string;
  qty: number;
  avg_price: number;
  unrealized_pnl: number;
  updated_at: string;
};

export type StrategySignal = {
  id: string;
  agent_id: string | null;
  symbol: string;
  signal: string;
  confidence: number | null;
  metadata: any;
  created_at: string;
};

export type PortfolioSnapshot = {
  id: string;
  exchange_account_id: string;
  total_value: number;
  breakdown: any;
  snapshot_at: string;
};

export function useExchangeAccounts() {
  const [data, setData] = useState<ExchangeAccount[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    supabase.from("exchange_accounts").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { if (mounted) { setData((data as any) ?? []); setLoading(false); } });
    const ch = supabase.channel("rt:exchange_accounts")
      .on("postgres_changes", { event: "*", schema: "public", table: "exchange_accounts" }, () => {
        supabase.from("exchange_accounts").select("*").order("created_at", { ascending: false })
          .then(({ data }) => mounted && setData((data as any) ?? []));
      })
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, []);
  return { data, loading };
}

export function useTrades(limit = 50) {
  const [data, setData] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    const load = () => supabase.from("trades").select("*").order("executed_at", { ascending: false }).limit(limit)
      .then(({ data }) => mounted && (setData((data as any) ?? []), setLoading(false)));
    load();
    const ch = supabase.channel("rt:trades")
      .on("postgres_changes", { event: "*", schema: "public", table: "trades" }, load).subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, [limit]);
  return { data, loading };
}

export function usePositions() {
  const [data, setData] = useState<Position[]>([]);
  useEffect(() => {
    let mounted = true;
    const load = () => supabase.from("positions").select("*").order("updated_at", { ascending: false })
      .then(({ data }) => mounted && setData((data as any) ?? []));
    load();
    const ch = supabase.channel("rt:positions")
      .on("postgres_changes", { event: "*", schema: "public", table: "positions" }, load).subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, []);
  return { data };
}

export function useStrategySignals(limit = 25) {
  const [data, setData] = useState<StrategySignal[]>([]);
  useEffect(() => {
    let mounted = true;
    const load = () => supabase.from("strategy_signals").select("*").order("created_at", { ascending: false }).limit(limit)
      .then(({ data }) => mounted && setData((data as any) ?? []));
    load();
    const ch = supabase.channel("rt:strategy_signals")
      .on("postgres_changes", { event: "*", schema: "public", table: "strategy_signals" }, load).subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, [limit]);
  return { data };
}

export function usePortfolioSnapshots(accountId?: string) {
  const [data, setData] = useState<PortfolioSnapshot[]>([]);
  useEffect(() => {
    let mounted = true;
    let q = supabase.from("portfolio_snapshots").select("*").order("snapshot_at", { ascending: true }).limit(200);
    if (accountId) q = q.eq("exchange_account_id", accountId);
    q.then(({ data }) => mounted && setData((data as any) ?? []));
    return () => { mounted = false; };
  }, [accountId]);
  return { data };
}
