// Simple Icons slugs + each brand's real color, so we can recreate the
// classic "colored badge with white glyph" look every app actually uses -
// a flat monochrome icon floating on plain white looked inconsistent and
// washed out next to real app icons.
type IconEntry = { slug: string; color: string };

const ICON_MAP: Record<string, IconEntry> = {
  whatsapp: { slug: "whatsapp", color: "#25D366" },
  telegram: { slug: "telegram", color: "#26A5E4" },
  facebook: { slug: "facebook", color: "#1877F2" },
  instagram: { slug: "instagram", color: "#E4405F" },
  google: { slug: "google", color: "#4285F4" },
  twitter: { slug: "x", color: "#000000" },
  "twitter/x": { slug: "x", color: "#000000" },
  tiktok: { slug: "tiktok", color: "#000000" },
  discord: { slug: "discord", color: "#5865F2" },
  snapchat: { slug: "snapchat", color: "#FFFC00" },
  microsoft: { slug: "microsoft", color: "#5E5E5E" },
  apple: { slug: "apple", color: "#555555" },
  amazon: { slug: "amazon", color: "#FF9900" },
  netflix: { slug: "netflix", color: "#E50914" },
  paypal: { slug: "paypal", color: "#00457C" },
  tinder: { slug: "tinder", color: "#FD5068" },
  uber: { slug: "uber", color: "#000000" },
  viber: { slug: "viber", color: "#7360F2" },
  line: { slug: "line", color: "#00C300" },
  wechat: { slug: "wechat", color: "#07C160" },
  signal: { slug: "signal", color: "#3A76F0" },
  linkedin: { slug: "linkedin", color: "#0A66C2" },
  pinterest: { slug: "pinterest", color: "#E60023" },
  reddit: { slug: "reddit", color: "#FF4500" },
  spotify: { slug: "spotify", color: "#1DB954" },
  ebay: { slug: "ebay", color: "#E53238" },
  yahoo: { slug: "yahoo", color: "#6001D2" },
  binance: { slug: "binance", color: "#F0B90B" },
  coinbase: { slug: "coinbase", color: "#0052FF" },
  steam: { slug: "steam", color: "#171A21" },
  playstation: { slug: "playstation", color: "#003791" },
  xbox: { slug: "xbox", color: "#107C10" },
  bumble: { slug: "bumble", color: "#FFC629" },
  lyft: { slug: "lyft", color: "#FF00BF" },
  doordash: { slug: "doordash", color: "#FF3008" },
  skype: { slug: "skype", color: "#00AFF0" },
  aliexpress: { slug: "aliexpress", color: "#FF4747" },
  shopify: { slug: "shopify", color: "#7AB55C" },
  twitch: { slug: "twitch", color: "#9146FF" },
  youtube: { slug: "youtube", color: "#FF0000" },
  venmo: { slug: "venmo", color: "#3D95CE" },
  revolut: { slug: "revolut", color: "#0075EB" },
  wise: { slug: "wise", color: "#9FE870" },
  hinge: { slug: "hinge", color: "#000000" },
  vk: { slug: "vk", color: "#0077FF" },
  "vk.com": { slug: "vk", color: "#0077FF" },
  threads: { slug: "threads", color: "#000000" },
  kakaotalk: { slug: "kakaotalk", color: "#FFCD00" },
  zalo: { slug: "zalo", color: "#0068FF" },
  grab: { slug: "grab", color: "#00B14F" },
  gojek: { slug: "gojek", color: "#00AA13" },
  deliveroo: { slug: "deliveroo", color: "#00CCBC" },
  instacart: { slug: "instacart", color: "#43B02A" },
  airbnb: { slug: "airbnb", color: "#FF5A5F" },
  booking: { slug: "bookingdotcom", color: "#003580" },
  tumblr: { slug: "tumblr", color: "#36465D" },
  grindr: { slug: "grindr", color: "#FF9900" },
  badoo: { slug: "badoo", color: "#783BF9" },
  okcupid: { slug: "okcupid", color: "#F02F63" },
  soundcloud: { slug: "soundcloud", color: "#FF5500" },
  deezer: { slug: "deezer", color: "#FEAA2D" },
  hulu: { slug: "hulu", color: "#1CE783" },
  disneyplus: { slug: "disneyplus", color: "#113CCF" },
  crunchyroll: { slug: "crunchyroll", color: "#F47521" },
  epicgames: { slug: "epicgames", color: "#313131" },
  roblox: { slug: "roblox", color: "#000000" },
  ea: { slug: "ea", color: "#000000" },
  ubisoft: { slug: "ubisoft", color: "#000000" },
  cashapp: { slug: "cashapp", color: "#00C244" },
  stripe: { slug: "stripe", color: "#635BFF" },
  chime: { slug: "chime", color: "#1FD15D" },
  walmart: { slug: "walmart", color: "#0071CE" },
  etsy: { slug: "etsy", color: "#F16521" },
  alibaba: { slug: "alibaba", color: "#FF6A00" },
  shein: { slug: "shein", color: "#000000" },
};

// Simple Icons' own hosted CDN. We always request the white ("ffffff")
// variant here and layer it on top of the brand color ourselves in
// ServiceIcon, which is what gives the consistent colored-badge look.
export function iconInfoForService(
  name: string
): { url: string; color: string } | null {
  const lower = name.toLowerCase();

  let entry = ICON_MAP[lower];
  if (!entry) {
    for (const key of Object.keys(ICON_MAP)) {
      if (lower.includes(key)) {
        entry = ICON_MAP[key];
        break;
      }
    }
  }
  if (!entry) return null;

  return {
    url: `https://cdn.simpleicons.org/${entry.slug}/ffffff`,
    color: entry.color,
  };
}
