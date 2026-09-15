"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { pToKobo, MIN_TOPUP_P } from "@/lib/currency";

export async function topUpWallet(amountKobo: number) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not logged in." };
  }

  if (!Number.isInteger(amountKobo) || amountKobo < pToKobo(MIN_TOPUP_P)) {
    return { error: `Minimum top-up is ${MIN_TOPUP_P}P.` };
  }

  const { error } = await supabase.rpc("topup_wallet", {
    p_amount_kobo: amountKobo,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { error: null };
}
