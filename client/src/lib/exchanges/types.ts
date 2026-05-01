export type ExchangeKind = "bitmart" | "binance" | "coinbase" | "kraken" | "other";
export type TradingMode = "paper" | "live";

export interface ExchangeBalance { asset: string; free: number; locked: number; }
export interface ExchangeTicker { symbol: string; price: number; change_24h: number; }

export interface ExchangeConnector {
  kind: ExchangeKind;
  getBalances(): Promise<ExchangeBalance[]>;
  getTicker(symbol: string): Promise<ExchangeTicker>;
  placeOrder(args: { symbol: string; side: "buy" | "sell"; qty: number; price?: number }): Promise<{ id: string; status: string }>;
}