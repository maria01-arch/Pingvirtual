// Maps a service's display name to its domain, so we can fetch a real logo
// from a public logo CDN (Clearbit) instead of a plain letter avatar.
// Only covers well-known apps - the long tail of 700+ HeroSMS services
// falls back to the gradient letter avatar, which is fine since those are
// rarely browsed visually (mostly found via search).
const DOMAIN_MAP: Record<string, string> = {
  whatsapp: "whatsapp.com",
  telegram: "telegram.org",
  facebook: "facebook.com",
  instagram: "instagram.com",
  google: "google.com",
  twitter: "twitter.com",
  "twitter/x": "twitter.com",
  tiktok: "tiktok.com",
  discord: "discord.com",
  snapchat: "snapchat.com",
  microsoft: "microsoft.com",
  apple: "apple.com",
  amazon: "amazon.com",
  netflix: "netflix.com",
  paypal: "paypal.com",
  tinder: "tinder.com",
  uber: "uber.com",
  viber: "viber.com",
  line: "line.me",
  wechat: "wechat.com",
  signal: "signal.org",
  linkedin: "linkedin.com",
  pinterest: "pinterest.com",
  reddit: "reddit.com",
  spotify: "spotify.com",
  ebay: "ebay.com",
  yahoo: "yahoo.com",
  binance: "binance.com",
  coinbase: "coinbase.com",
  steam: "steampowered.com",
  playstation: "playstation.com",
  xbox: "xbox.com",
  bumble: "bumble.com",
  lyft: "lyft.com",
  doordash: "doordash.com",
  skype: "skype.com",
  aliexpress: "aliexpress.com",
  shopify: "shopify.com",
  twitch: "twitch.tv",
  youtube: "youtube.com",
  grindr: "grindr.com",
  venmo: "venmo.com",
  revolut: "revolut.com",
  wise: "wise.com",
  badoo: "badoo.com",
  hinge: "hinge.co",
};

export function iconUrlForService(name: string): string | null {
  const domain = DOMAIN_MAP[name.toLowerCase()];
  if (!domain) return null;
  // Google's public favicon service - no API key needed, still active as of
  // this writing (Clearbit's equivalent free logo API shut down Dec 2025).
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}
