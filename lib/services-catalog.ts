// How much we charge the user on top of the raw 5SIM cost. 1.5 = 50% markup.
export const MARKUP_MULTIPLIER = 1.5;

export type ServiceCatalogEntry = {
  product: string; // the exact 5SIM product identifier
  label: string;
  colorClass: string;
};

// This is just the "which apps to feature" list - a curated shortlist for
// browsing. It is NOT where country/price data lives; that's fetched live
// per-product from 5SIM in lib/providers/5sim.ts (getPricesForProduct).
export const POPULAR_SERVICES: ServiceCatalogEntry[] = [
  { product: "whatsapp", label: "WhatsApp", colorClass: "bg-emerald-500" },
  { product: "telegram", label: "Telegram", colorClass: "bg-sky-500" },
  { product: "facebook", label: "Facebook", colorClass: "bg-blue-600" },
  { product: "google", label: "Google", colorClass: "bg-red-500" },
  { product: "instagram", label: "Instagram", colorClass: "bg-pink-500" },
  { product: "discord", label: "Discord", colorClass: "bg-indigo-500" },
  { product: "tiktok", label: "TikTok", colorClass: "bg-slate-800" },
  { product: "twitter", label: "Twitter / X", colorClass: "bg-slate-500" },
  { product: "microsoft", label: "Microsoft", colorClass: "bg-cyan-600" },
  { product: "apple", label: "Apple", colorClass: "bg-slate-700" },
  { product: "amazon", label: "Amazon", colorClass: "bg-orange-500" },
  { product: "netflix", label: "Netflix", colorClass: "bg-red-600" },
  { product: "paypal", label: "PayPal", colorClass: "bg-blue-500" },
  { product: "tinder", label: "Tinder", colorClass: "bg-rose-500" },
  { product: "snapchat", label: "Snapchat", colorClass: "bg-yellow-400" },
  { product: "uber", label: "Uber", colorClass: "bg-black" },
  { product: "viber", label: "Viber", colorClass: "bg-purple-600" },
  { product: "line", label: "LINE", colorClass: "bg-green-500" },
  { product: "wechat", label: "WeChat", colorClass: "bg-green-600" },
  { product: "signal", label: "Signal", colorClass: "bg-blue-700" },
];
