// HeroSMS's service list is just {code, name} - no category field - so we
// group services ourselves via keyword matching. Anything not matched
// falls through to search only (not shown in a category section), keeping
// the default view focused instead of dumping hundreds of obscure entries.
export const CATEGORIES: { label: string; icon: string; keywords: string[] }[] = [
  {
    label: "Communication",
    icon: "💬",
    keywords: ["whatsapp", "telegram", "viber", "signal", "wechat", "line", "imo", "skype", "discord", "kakaotalk", "zalo", "botim"],
  },
  {
    label: "Social Media",
    icon: "📱",
    keywords: ["facebook", "instagram", "twitter", "tiktok", "snapchat", "reddit", "linkedin", "pinterest", "threads", "vk", "tumblr"],
  },
  {
    label: "Tech & Email",
    icon: "💻",
    keywords: ["google", "microsoft", "apple", "yahoo", "protonmail", "outlook", "icloud", "aol"],
  },
  {
    label: "Shopping",
    icon: "🛍️",
    keywords: ["amazon", "ebay", "shopify", "walmart", "aliexpress", "etsy", "alibaba", "shein", "temu", "jumia"],
  },
  {
    label: "Finance",
    icon: "💳",
    keywords: ["paypal", "payoneer", "skrill", "cash app", "venmo", "revolut", "wise", "coinbase", "binance", "stripe", "chime"],
  },
  {
    label: "Entertainment",
    icon: "🎬",
    keywords: ["netflix", "spotify", "disney", "hbo", "youtube", "twitch", "hulu", "soundcloud", "deezer"],
  },
  {
    label: "Dating",
    icon: "❤️",
    keywords: ["tinder", "bumble", "badoo", "hinge", "grindr", "okcupid", "match"],
  },
  {
    label: "Transport & Delivery",
    icon: "🚗",
    keywords: ["uber", "lyft", "bolt", "doordash", "grab", "gojek", "deliveroo", "instacart", "careem"],
  },
  {
    label: "Gaming",
    icon: "🎮",
    keywords: ["steam", "playstation", "xbox", "epic games", "battle.net", "roblox", "riot", "ubisoft", "ea"],
  },
];

export function categoryForName(name: string): string | null {
  const lower = name.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.keywords.some((k) => lower.includes(k))) return cat.label;
  }
  return null;
}
