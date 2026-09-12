// Placeholder catalog for browsing. Prices shown here are illustrative -
// the real charge is calculated from the live 5SIM price at purchase time
// (see lib/actions/orders.ts), with MARKUP_MULTIPLIER applied on top.
export type ServiceListing = {
  slug: string;
  service: string;
  country: string;
  flag: string;
  priceCents: number;
  available: number;
  colorClass: string;
  // 5SIM identifiers - verify these against 5SIM's own /guest/countries and
  // /guest/products endpoints if a purchase fails with "not found".
  fivesimCountry: string;
  fivesimProduct: string;
};

// How much we charge the user on top of the raw 5SIM cost. 1.5 = 50% markup.
export const MARKUP_MULTIPLIER = 1.5;

export const MOCK_SERVICES: ServiceListing[] = [
  { slug: "whatsapp-us", service: "WhatsApp", country: "United States", flag: "🇺🇸", priceCents: 45, available: 18234, colorClass: "bg-emerald-500", fivesimCountry: "usa", fivesimProduct: "whatsapp" },
  { slug: "whatsapp-uk", service: "WhatsApp", country: "United Kingdom", flag: "🇬🇧", priceCents: 52, available: 9021, colorClass: "bg-emerald-500", fivesimCountry: "england", fivesimProduct: "whatsapp" },
  { slug: "telegram-us", service: "Telegram", country: "United States", flag: "🇺🇸", priceCents: 30, available: 22110, colorClass: "bg-sky-500", fivesimCountry: "usa", fivesimProduct: "telegram" },
  { slug: "facebook-us", service: "Facebook", country: "United States", flag: "🇺🇸", priceCents: 38, available: 15300, colorClass: "bg-blue-600", fivesimCountry: "usa", fivesimProduct: "facebook" },
  { slug: "facebook-ng", service: "Facebook", country: "Nigeria", flag: "🇳🇬", priceCents: 25, available: 4032, colorClass: "bg-blue-600", fivesimCountry: "nigeria", fivesimProduct: "facebook" },
  { slug: "google-us", service: "Google", country: "United States", flag: "🇺🇸", priceCents: 40, available: 12876, colorClass: "bg-red-500", fivesimCountry: "usa", fivesimProduct: "google" },
  { slug: "instagram-us", service: "Instagram", country: "United States", flag: "🇺🇸", priceCents: 42, available: 8760, colorClass: "bg-pink-500", fivesimCountry: "usa", fivesimProduct: "instagram" },
  { slug: "discord-us", service: "Discord", country: "United States", flag: "🇺🇸", priceCents: 35, available: 6200, colorClass: "bg-indigo-500", fivesimCountry: "usa", fivesimProduct: "discord" },
];
