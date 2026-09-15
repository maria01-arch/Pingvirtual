// How much we charge the user on top of the raw provider cost. 4.0 = 4x markup.
export const MARKUP_MULTIPLIER = 4.0;

// Labels only - used to surface a "Popular" shortlist at the top of the
// Services tab. The actual catalog (700+ services) is fetched live from
// HeroSMS; this just decides which of those live entries to feature first.
export const POPULAR_LABELS = [
  "WhatsApp", "Telegram", "Facebook", "Google", "Instagram", "Discord",
  "TikTok", "Twitter", "Microsoft", "Apple", "Amazon", "Netflix",
  "PayPal", "Tinder", "Snapchat", "Uber", "Viber", "Line", "WeChat", "Signal",
];

const COLOR_PALETTE = [
  "bg-emerald-500", "bg-sky-500", "bg-blue-600", "bg-red-500",
  "bg-pink-500", "bg-indigo-500", "bg-orange-500", "bg-purple-600",
  "bg-teal-500", "bg-rose-500", "bg-cyan-600", "bg-amber-500",
];

// Deterministic color per service name, since we can't hand-curate a color
// for hundreds of live-fetched services.
export function colorForLabel(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  }
  return COLOR_PALETTE[hash % COLOR_PALETTE.length];
}
