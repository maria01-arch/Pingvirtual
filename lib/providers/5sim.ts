// Thin wrapper around the 5SIM v1 API.
// Docs: https://5sim.net/docs
// All calls are server-only - FIVESIM_API_KEY must never reach the client.

const BASE_URL = "https://5sim.net/v1";

function authHeaders() {
  const apiKey = process.env.FIVESIM_API_KEY;
  if (!apiKey) {
    throw new Error("FIVESIM_API_KEY is not set on the server.");
  }
  return {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  };
}

export type FiveSimOrder = {
  id: number;
  phone: string;
  operator: string;
  product: string;
  price: number;
  status: "PENDING" | "RECEIVED" | "CANCELED" | "TIMEOUT" | "FINISHED" | "BANNED";
  expires: string;
  country: string;
  sms: { code: string; text: string; date: string }[];
};

export async function getProductPrice(
  country: string,
  product: string
): Promise<{ cost: number; count: number } | null> {
  const res = await fetch(
    `${BASE_URL}/guest/products/${country}/any`,
    { headers: authHeaders(), cache: "no-store" }
  );
  if (!res.ok) return null;

  const data = await res.json();
  const entry = data?.[product];
  if (!entry) return null;

  return { cost: entry.Price, count: entry.Qty };
}

export type CountryInfo = {
  slug: string; // 5SIM's internal country identifier, e.g. "usa"
  name: string;
  iso: string; // 2-letter code, for flag display
};

// Fallback if /guest/countries returns empty/unexpected - these slugs are
// known-good (usa and england were confirmed working via real purchases).
const FALLBACK_COUNTRIES: CountryInfo[] = [
  { slug: "usa", name: "United States", iso: "us" },
  { slug: "england", name: "United Kingdom", iso: "gb" },
  { slug: "nigeria", name: "Nigeria", iso: "ng" },
  { slug: "russia", name: "Russia", iso: "ru" },
  { slug: "ukraine", name: "Ukraine", iso: "ua" },
  { slug: "kazakhstan", name: "Kazakhstan", iso: "kz" },
  { slug: "indonesia", name: "Indonesia", iso: "id" },
  { slug: "philippines", name: "Philippines", iso: "ph" },
  { slug: "vietnam", name: "Vietnam", iso: "vn" },
  { slug: "india", name: "India", iso: "in" },
  { slug: "brazil", name: "Brazil", iso: "br" },
  { slug: "mexico", name: "Mexico", iso: "mx" },
  { slug: "france", name: "France", iso: "fr" },
  { slug: "germany", name: "Germany", iso: "de" },
  { slug: "poland", name: "Poland", iso: "pl" },
  { slug: "canada", name: "Canada", iso: "ca" },
];

export async function getCountries(): Promise<CountryInfo[]> {
  const res = await fetch(`${BASE_URL}/guest/countries`, {
    headers: authHeaders(),
    next: { revalidate: 3600 }, // country list barely changes - cache 1hr
  });
  if (!res.ok) return FALLBACK_COUNTRIES;

  const data = await res.json();
  const countries: CountryInfo[] = [];

  for (const slug of Object.keys(data)) {
    if (slug === "any") continue; // not a real country
    const entry = data[slug];
    const isoCode = entry?.iso ? Object.keys(entry.iso)[0] : "";
    countries.push({
      slug,
      name: entry?.text_en ?? slug,
      iso: isoCode ?? "",
    });
  }

  return countries.length > 0 ? countries : FALLBACK_COUNTRIES;
}

export type CountryPrice = {
  countrySlug: string;
  operator: string;
  cost: number;
  count: number;
};

async function getCountryProductsCached(country: string) {
  const res = await fetch(`${BASE_URL}/guest/products/${country}/any`, {
    headers: authHeaders(),
    next: { revalidate: 120 }, // short cache - prices/stock shift often
  });
  if (!res.ok) return null;
  return res.json();
}

// Live per-country pricing for one product, built on the same
// /guest/products/{country}/any endpoint that purchases already use
// successfully - not the separate bulk /guest/prices endpoint, which
// returned an unverified/incorrect shape.
export async function getPricesForProduct(
  product: string
): Promise<CountryPrice[]> {
  const countries = await getCountries();

  const settled = await Promise.allSettled(
    countries.map(async (c): Promise<CountryPrice | null> => {
      const data = await getCountryProductsCached(c.slug);
      const entry = data?.[product];
      if (!entry || !entry.Qty || entry.Qty < 1) return null;
      return {
        countrySlug: c.slug,
        operator: "any",
        cost: entry.Price,
        count: entry.Qty,
      };
    })
  );

  const results: CountryPrice[] = [];
  for (const r of settled) {
    if (r.status === "fulfilled" && r.value) results.push(r.value);
  }

  return results.sort((a, b) => a.cost - b.cost);
}

export async function buyActivation(
  country: string,
  product: string,
  operator: string = "any"
): Promise<FiveSimOrder> {
  const res = await fetch(
    `${BASE_URL}/user/buy/activation/${country}/${operator}/${product}`,
    { headers: authHeaders(), cache: "no-store" }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`5SIM buy failed (${res.status}): ${text}`);
  }

  return res.json();
}

export async function checkActivation(orderId: number): Promise<FiveSimOrder> {
  const res = await fetch(`${BASE_URL}/user/check/${orderId}`, {
    headers: authHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`5SIM check failed (${res.status}): ${text}`);
  }

  return res.json();
}

export async function cancelActivation(orderId: number): Promise<FiveSimOrder> {
  const res = await fetch(`${BASE_URL}/user/cancel/${orderId}`, {
    headers: authHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`5SIM cancel failed (${res.status}): ${text}`);
  }

  return res.json();
}

export async function finishActivation(orderId: number): Promise<FiveSimOrder> {
  const res = await fetch(`${BASE_URL}/user/finish/${orderId}`, {
    headers: authHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`5SIM finish failed (${res.status}): ${text}`);
  }

  return res.json();
}
