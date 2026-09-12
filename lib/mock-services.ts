// Placeholder catalog. In the next step this gets replaced by a live
// fetch from the 5SIM pricing endpoint (with SMS-Activate as fallback).
export type ServiceListing = {
  slug: string;
  service: string;
  country: string;
  flag: string;
  priceCents: number;
  available: number;
  colorClass: string;
};

export const MOCK_SERVICES: ServiceListing[] = [
  { slug: "whatsapp-us", service: "WhatsApp", country: "United States", flag: "🇺🇸", priceCents: 45, available: 18234, colorClass: "bg-emerald-500" },
  { slug: "whatsapp-uk", service: "WhatsApp", country: "United Kingdom", flag: "🇬🇧", priceCents: 52, available: 9021, colorClass: "bg-emerald-500" },
  { slug: "telegram-us", service: "Telegram", country: "United States", flag: "🇺🇸", priceCents: 30, available: 22110, colorClass: "bg-sky-500" },
  { slug: "facebook-us", service: "Facebook", country: "United States", flag: "🇺🇸", priceCents: 38, available: 15300, colorClass: "bg-blue-600" },
  { slug: "facebook-ng", service: "Facebook", country: "Nigeria", flag: "🇳🇬", priceCents: 25, available: 4032, colorClass: "bg-blue-600" },
  { slug: "google-us", service: "Google", country: "United States", flag: "🇺🇸", priceCents: 40, available: 12876, colorClass: "bg-red-500" },
  { slug: "instagram-us", service: "Instagram", country: "United States", flag: "🇺🇸", priceCents: 42, available: 8760, colorClass: "bg-pink-500" },
  { slug: "discord-us", service: "Discord", country: "United States", flag: "🇺🇸", priceCents: 35, available: 6200, colorClass: "bg-indigo-500" },
];
