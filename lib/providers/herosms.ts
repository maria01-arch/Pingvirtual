// Thin wrapper around the HeroSMS API (hero-sms.com), which implements the
// long-standing "SMS-Activate protocol" - the same query-param/handler_api.php
// style used by many resellers in this space. Confirmed independently across
// multiple third-party integrations (npm, PyPI, a Raycast extension).
// All calls are server-only - HEROSMS_API_KEY must never reach the client.

const BASE_URL = "https://hero-sms.com/stubs/handler_api.php";

function apiKey() {
  const key = process.env.HEROSMS_API_KEY;
  if (!key) throw new Error("HEROSMS_API_KEY is not set on the server.");
  return key;
}

async function call(
  params: Record<string, string>,
  revalidateSeconds?: number
): Promise<string> {
  const url = new URL(BASE_URL);
  url.searchParams.set("api_key", apiKey());
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(
    url.toString(),
    revalidateSeconds
      ? { next: { revalidate: revalidateSeconds } }
      : { cache: "no-store" }
  );
  const text = await res.text();

  if (!res.ok) throw new Error(`HeroSMS HTTP ${res.status}: ${text}`);
  if (text.startsWith("BAD_KEY")) throw new Error("HeroSMS: invalid API key.");
  if (text.startsWith("ERROR_SQL")) throw new Error("HeroSMS: server error, try again.");
  if (text.startsWith("NO_BALANCE")) throw new Error("HeroSMS: account balance is empty.");
  if (text.startsWith("NO_NUMBERS")) throw new Error("HeroSMS: no numbers available.");

  return text;
}

// Tries JSON first (V2 endpoints), falls back to raw text (legacy endpoints).
async function callJsonOrText(
  params: Record<string, string>,
  revalidateSeconds?: number
): Promise<any> {
  const text = await call(params, revalidateSeconds);
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function getBalance(): Promise<number> {
  const text = await call({ action: "getBalance" });
  // Format: "ACCESS_BALANCE:12.50"
  const match = text.match(/ACCESS_BALANCE:([\d.]+)/);
  if (!match) throw new Error(`Unexpected getBalance response: ${text}`);
  return parseFloat(match[1]);
}

export type HeroSmsService = { code: string; name: string };

export async function getServicesList(): Promise<HeroSmsService[]> {
  const data = await callJsonOrText({ action: "getServicesList" }, 3600); // 1hr cache - catalog barely changes
  const list = data?.services ?? data;
  if (!Array.isArray(list)) return [];
  return list.map((s: any) => ({
    code: s.code ?? s.id,
    name: s.name ?? s.title ?? s.code,
  }));
}

export type HeroSmsCountry = { id: string; name: string };

export async function getCountriesList(): Promise<HeroSmsCountry[]> {
  const data = await callJsonOrText({ action: "getCountries" }, 3600);
  const entries = Array.isArray(data) ? data : Object.values(data ?? {});
  return entries.map((c: any) => ({
    id: String(c.id),
    name: c.eng ?? c.name ?? String(c.id),
  }));
}

// Finds the HeroSMS service code matching a human label (e.g. "WhatsApp")
// by live lookup rather than a hardcoded guess - services/codes can differ
// between providers and we got burned once already assuming a code shape.
export async function findServiceCode(label: string): Promise<string | null> {
  const services = await getServicesList();
  const target = label.toLowerCase();
  const match = services.find((s) => s.name.toLowerCase() === target)
    ?? services.find((s) => s.name.toLowerCase().includes(target));
  return match?.code ?? null;
}

export async function findCountryId(name: string): Promise<string | null> {
  const countries = await getCountriesList();
  const target = name.toLowerCase();
  const match = countries.find((c) => c.name.toLowerCase() === target)
    ?? countries.find((c) => c.name.toLowerCase().includes(target));
  return match?.id ?? null;
}

export type HeroSmsPrice = { countryId: string; cost: number; count: number };

// Prices for one service, across every country HeroSMS has it in stock in.
export async function getPricesForService(
  serviceCode: string
): Promise<HeroSmsPrice[]> {
  const data = await callJsonOrText(
    { action: "getPrices", service: serviceCode },
    120 // short cache - prices/stock shift often
  );
  const results: HeroSmsPrice[] = [];

  for (const countryId of Object.keys(data ?? {})) {
    const entry = data[countryId]?.[serviceCode];
    if (!entry) continue;
    const cost = Number(entry.cost);
    const count = Number(entry.count);
    if (count > 0) results.push({ countryId, cost, count });
  }

  return results.sort((a, b) => a.cost - b.cost);
}

export type HeroSmsOrder = {
  activationId: string;
  phoneNumber: string;
  cost: number;
  expiresAt: string | null;
};

export async function buyNumber(
  serviceCode: string,
  countryId: string
): Promise<HeroSmsOrder> {
  const data = await callJsonOrText({
    action: "getNumberV2",
    service: serviceCode,
    country: countryId,
  });

  if (typeof data === "string") {
    throw new Error(`HeroSMS buy failed: ${data}`);
  }

  // Field name for expiry isn't confirmed from documentation - check a few
  // common shapes defensively; if none match, expiresAt stays null and the
  // UI just won't show a countdown (falls back to the auto-refund message).
  const expiresAt =
    data.expires ?? data.expiresAt ?? data.expired_at ?? data.expiryDate ?? null;

  return {
    activationId: String(data.activationId),
    phoneNumber: String(data.phoneNumber),
    cost: Number(data.activationCost ?? data.cost ?? 0),
    expiresAt: expiresAt ? String(expiresAt) : null,
  };
}

export type HeroSmsStatus = {
  status: "WAITING" | "RECEIVED" | "CANCELLED";
  code: string | null;
  raw: unknown; // temporary - lets us see exactly what HeroSMS actually sends back
};

export async function checkStatus(activationId: string): Promise<HeroSmsStatus> {
  const data = await callJsonOrText({ action: "getStatusV2", id: activationId });

  // Handle both a JSON shape and the legacy "STATUS_OK:1234" text shape.
  if (typeof data === "string") {
    if (data.startsWith("STATUS_OK:")) {
      return { status: "RECEIVED", code: data.split(":")[1], raw: data };
    }
    if (data.startsWith("STATUS_CANCEL")) return { status: "CANCELLED", code: null, raw: data };
    return { status: "WAITING", code: null, raw: data };
  }

  // Try every plausible field name/shape we can think of for the code.
  // Confirmed real shape from HeroSMS: { data: { code, text, ... }, sms: { code, text, ... }, call: null }
  const code =
    data.sms?.code ??
    data.data?.code ??
    data.smsCode ??
    data.code ??
    data.sms_code ??
    data.otp ??
    data.text ??
    null;

  const statusField = data.status ?? data.activationStatus ?? "";

  if (
    statusField === "STATUS_OK" ||
    statusField === "RECEIVED" ||
    statusField === "6" ||
    (code && String(code).length > 0)
  ) {
    return { status: "RECEIVED", code: code ? String(code) : null, raw: data };
  }
  if (
    statusField === "STATUS_CANCEL" ||
    statusField === "CANCELLED" ||
    statusField === "8"
  ) {
    return { status: "CANCELLED", code: null, raw: data };
  }
  return { status: "WAITING", code: null, raw: data };
}

// status: 1 = mark ready, 3 = request another code, 6 = complete, 8 = cancel
async function setStatus(activationId: string, status: number): Promise<void> {
  await call({ action: "setStatus", id: activationId, status: String(status) });
}

export const finishActivation = (id: string) => setStatus(id, 6);
export const cancelActivation = (id: string) => setStatus(id, 8);
