// Maps a service's display name to a Simple Icons slug, so we can fetch a
// real brand icon. Only covers well-known apps - the long tail of 700+
// HeroSMS services falls back to the gradient letter avatar, which is fine
// since those are rarely browsed visually (mostly found via search).
// Simple Icons slugs - mostly the lowercase name with no spaces, with a
// few explicit overrides where the brand/slug naming differs.
const SLUG_MAP: Record<string, string> = {
  whatsapp: "whatsapp",
  telegram: "telegram",
  facebook: "facebook",
  instagram: "instagram",
  google: "google",
  twitter: "x",
  "twitter/x": "x",
  tiktok: "tiktok",
  discord: "discord",
  snapchat: "snapchat",
  microsoft: "microsoft",
  apple: "apple",
  amazon: "amazon",
  netflix: "netflix",
  paypal: "paypal",
  tinder: "tinder",
  uber: "uber",
  viber: "viber",
  line: "line",
  wechat: "wechat",
  signal: "signal",
  linkedin: "linkedin",
  pinterest: "pinterest",
  reddit: "reddit",
  spotify: "spotify",
  ebay: "ebay",
  yahoo: "yahoo",
  binance: "binance",
  coinbase: "coinbase",
  steam: "steam",
  playstation: "playstation",
  xbox: "xbox",
  bumble: "bumble",
  lyft: "lyft",
  doordash: "doordash",
  skype: "skype",
  aliexpress: "aliexpress",
  shopify: "shopify",
  twitch: "twitch",
  youtube: "youtube",
  venmo: "venmo",
  revolut: "revolut",
  wise: "wise",
  hinge: "hinge",
  vk: "vk",
  "vk.com": "vk",
  threads: "threads",
};

// Simple Icons' own hosted CDN - returns the icon in its official brand
// color by default, and (importantly) a real 404 for anything it doesn't
// have, so our onError fallback actually fires instead of silently
// showing a blank/generic result the way Google's favicon service did.
export function iconUrlForService(name: string): string | null {
  const lower = name.toLowerCase();

  // Exact match first (covers plain names like "Facebook").
  if (SLUG_MAP[lower]) {
    return `https://cdn.simpleicons.org/${SLUG_MAP[lower]}`;
  }

  // Substring match for combined/compound names HeroSMS sometimes uses,
  // e.g. "TikTok/Douyin", "Instagram+Threads", "vk.com".
  for (const key of Object.keys(SLUG_MAP)) {
    if (lower.includes(key)) {
      return `https://cdn.simpleicons.org/${SLUG_MAP[key]}`;
    }
  }

  return null;
}
