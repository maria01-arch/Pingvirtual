"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function topUpWallet(amountCents: number) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not logged in." };
  }

  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return { error: "Enter a valid amount." };
  }

  const { error } = await supabase.rpc("topup_wallet", {
    p_amount_cents: amountCents,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { error: null };
}
