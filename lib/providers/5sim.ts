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
