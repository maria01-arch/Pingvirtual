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

const GRADIENT_PALETTE = [
  "from-emerald-400 to-teal-600",
  "from-sky-400 to-blue-600",
  "from-blue-500 to-indigo-700",
  "from-rose-400 to-red-600",
  "from-pink-400 to-fuchsia-600",
  "from-indigo-400 to-violet-700",
  "from-orange-400 to-amber-600",
  "from-purple-400 to-purple-700",
  "from-teal-400 to-cyan-700",
  "from-rose-400 to-pink-600",
  "from-cyan-400 to-blue-700",
  "from-amber-300 to-orange-600",
];

// Deterministic gradient per service name, since we can't hand-curate a
// look for hundreds of live-fetched services.
export function colorForLabel(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  }
  return `bg-gradient-to-br ${GRADIENT_PALETTE[hash % GRADIENT_PALETTE.length]}`;
}
