// Storage unit is kobo (1 Naira = 100 kobo) - exact integer arithmetic,
// standard for Nigerian payment amounts.
//
// P is a customer-facing denomination on top of that: 1P = 500 NGN.
// Exchange rate: 1 USD = 1500 NGN -> 1 USD = 3P -> 1P = 1/3 USD.
//
// Provider costs (5SIM, HeroSMS) come back in USD - convert to kobo for
// all storage and wallet math, and only convert to P for display.

export const NGN_PER_P = 500;
export const NGN_PER_USD = 1500;
export const KOBO_PER_NAIRA = 100;

export const KOBO_PER_P = NGN_PER_P * KOBO_PER_NAIRA; // 50,000
export const KOBO_PER_USD = NGN_PER_USD * KOBO_PER_NAIRA; // 150,000

export const MIN_TOPUP_P = 1;

export function usdToKobo(usd: number): number {
  return Math.round(usd * KOBO_PER_USD);
}

export function pToKobo(p: number): number {
  return Math.round(p * KOBO_PER_P);
}

export function koboToP(kobo: number): number {
  return kobo / KOBO_PER_P;
}

// Canonical purchase-cost formula - the ONLY place this math should happen,
// so every page (listing, detail, actual purchase) always agrees exactly.
// P = ceil( cost_usd * NGN_per_USD * markup / NGN_per_P )
export function usdCostToP(usdCost: number, markupMultiplier: number): number {
  return Math.ceil((usdCost * NGN_PER_USD * markupMultiplier) / NGN_PER_P);
}

export function usdCostToKobo(usdCost: number, markupMultiplier: number): number {
  return pToKobo(usdCostToP(usdCost, markupMultiplier));
}

export function formatP(kobo: number): string {
  return `${koboToP(kobo).toFixed(2)}P`;
}

export function formatNaira(kobo: number): string {
  return `₦${(kobo / KOBO_PER_NAIRA).toLocaleString()}`;
}
