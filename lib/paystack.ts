// Thin wrapper around Paystack's REST API. Server-only - PAYSTACK_SECRET_KEY
// must never reach the client.

const BASE_URL = "https://api.paystack.co";

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set on the server.");
  return key;
}

export async function initializeTransaction(params: {
  email: string;
  amountKobo: number; // Paystack takes NGN amounts in kobo - same unit we store internally
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<{ authorizationUrl: string; reference: string }> {
  const res = await fetch(`${BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
    cache: "no-store",
  });

  const data = await res.json();
  if (!data.status) {
    throw new Error(data.message || "Paystack initialize failed.");
  }

  return {
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
  };
}

export type PaystackVerifyResult = {
  status: string; // "success" | "failed" | "abandoned"
  reference: string;
  amountKobo: number;
  email: string;
  metadata: Record<string, any>;
};

export async function verifyTransaction(
  reference: string
): Promise<PaystackVerifyResult> {
  const res = await fetch(
    `${BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secretKey()}` },
      cache: "no-store",
    }
  );

  const data = await res.json();
  if (!data.status) {
    throw new Error(data.message || "Paystack verify failed.");
  }

  return {
    status: data.data.status,
    reference: data.data.reference,
    amountKobo: data.data.amount,
    email: data.data.customer?.email ?? "",
    metadata: data.data.metadata ?? {},
  };
}
