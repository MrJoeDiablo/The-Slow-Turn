import { ExchangeConnector } from "./types";

// TODO: wire to BitMart via the exchange-proxy edge function. Never call BitMart directly from the browser.
export const bitmart: ExchangeConnector = {
  kind: "bitmart",
  async getBalances() { throw new Error("BitMart connector not yet implemented"); },
  async getTicker() { throw new Error("BitMart connector not yet implemented"); },
  async placeOrder() { throw new Error("BitMart connector not yet implemented"); },
};