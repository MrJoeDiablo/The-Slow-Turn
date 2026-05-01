import { ExchangeConnector, ExchangeKind } from "./types";
import { bitmart } from "./bitmart";

const registry: Partial<Record<ExchangeKind, ExchangeConnector>> = { bitmart };

export function getExchange(kind: ExchangeKind): ExchangeConnector | undefined {
  return registry[kind];
}

export const supportedExchanges: ExchangeKind[] = ["bitmart"];