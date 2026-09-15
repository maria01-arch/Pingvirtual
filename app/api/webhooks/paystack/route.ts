import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    return new Response("Server misconfigured", { status: 500 });
  }

  const expectedSignature = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSignature) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const { reference, amount, metadata } = event.data;
    const userId = metadata?.user_id;

    if (userId) {
      const admin = createAdminClient();
      const { error } = await admin.rpc("credit_wallet_by_reference", {
        p_user_id: userId,
        p_amount_kobo: amount,
        p_reference: reference,
        p_description: "Wallet top-up (Paystack)",
      });
      if (error) {
        // Log and still return 200 - Paystack retries on non-2xx, and
        // retrying won't fix a bad RPC call. Surface this in Vercel logs.
        console.error("Paystack webhook credit failed:", error.message);
      }
    }
  }

  return new Response("OK", { status: 200 });
}
