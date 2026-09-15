"use server";

import { createClient } from "@/lib/supabase/server";
import { initializeTransaction, verifyTransaction } from "@/lib/paystack";
import { pToKobo, MIN_TOPUP_P } from "@/lib/currency";
import { randomUUID } from "crypto";

export async function initiatePaystackPayment(amountP: number) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) return { error: "Not logged in." };

  if (!Number.isFinite(amountP) || amountP < MIN_TOPUP_P) {
    return { error: `Minimum top-up is ${MIN_TOPUP_P}P.` };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return { error: "Site URL is not configured on the server." };

  const amountKobo = pToKobo(amountP);
  const reference = `pv_${user.id.slice(0, 8)}_${Date.now()}_${randomUUID().slice(0, 8)}`;

  try {
    const init = await initializeTransaction({
      email: user.email,
      amountKobo,
      reference,
      callbackUrl: `${siteUrl}/dashboard/wallet/paystack-callback`,
      metadata: { user_id: user.id, amount_p: amountP },
    });
    return { error: null, authorizationUrl: init.authorizationUrl };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function verifyAndCreditPayment(reference: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not logged in.", credited: false };

  try {
    const tx = await verifyTransaction(reference);

    if (tx.status !== "success") {
      return { error: `Payment ${tx.status}.`, credited: false };
    }

    // Make sure this payment was actually initiated by the logged-in user,
    // not just a reference someone pasted into the URL.
    if (tx.metadata?.user_id !== user.id) {
      return { error: "This payment doesn't match your account.", credited: false };
    }

    const { error } = await supabase.rpc("credit_wallet_verified", {
      p_amount_kobo: tx.amountKobo,
      p_reference: tx.reference,
      p_description: "Wallet top-up (Paystack)",
    });

    if (error) return { error: error.message, credited: false };

    return { error: null, credited: true, amountKobo: tx.amountKobo };
  } catch (err: any) {
    return { error: err.message, credited: false };
  }
}
