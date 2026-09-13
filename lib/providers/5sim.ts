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

export async function getCountries(): Promise<CountryInfo[]> {
  const res = await fetch(`${BASE_URL}/guest/countries`, {
    headers: authHeaders(),
    next: { revalidate: 3600 }, // country list barely changes - cache 1hr
  });
  if (!res.ok) return [];

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

  return countries;
}

export type CountryPrice = {
  countrySlug: string;
  operator: string;
  cost: number;
  count: number;
};

// Live per-country pricing for one product, across every country 5SIM
// offers it in. This is what replaces a hardcoded country list.
export async function getPricesForProduct(
  product: string
): Promise<CountryPrice[]> {
  const res = await fetch(`${BASE_URL}/guest/prices?product=${product}`, {
    headers: authHeaders(),
    next: { revalidate: 120 }, // prices shift often - short cache
  });
  if (!res.ok) return [];

  const data = await res.json();
  const results: CountryPrice[] = [];

  for (const countrySlug of Object.keys(data)) {
    const operators = data[countrySlug]?.[product];
    if (!operators) continue;

    // Prefer the "any" operator if it's in stock; otherwise take whichever
    // named operator is cheapest and actually has numbers available.
    let best: CountryPrice | null = null;
    for (const operator of Object.keys(operators)) {
      const { cost, count } = operators[operator];
      if (!count || count < 1) continue;
      if (operator === "any") {
        best = { countrySlug, operator, cost, count };
        break;
      }
      if (!best || cost < best.cost) {
        best = { countrySlug, operator, cost, count };
      }
    }
    if (best) results.push(best);
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
