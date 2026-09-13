"use server";

import { createClient } from "@/lib/supabase/server";
import {
  buyActivation,
  checkActivation,
  cancelActivation,
  getProductPrice,
  getCountries,
} from "@/lib/providers/5sim";
import { POPULAR_SERVICES, MARKUP_MULTIPLIER } from "@/lib/services-catalog";
import { revalidatePath } from "next/cache";

export async function purchaseNumber(product: string, country: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not logged in." };

  const service = POPULAR_SERVICES.find((s) => s.product === product);
  if (!service) return { error: "Unknown service." };

  // 1. Get the live price from 5SIM (raw provider cost, in dollars).
  let priceInfo;
  try {
    priceInfo = await getProductPrice(country, product);
  } catch (err: any) {
    return { error: `Could not reach 5SIM: ${err.message}` };
  }

  if (!priceInfo || priceInfo.count < 1) {
    return { error: "No numbers available for this service right now." };
  }

  const costCents = Math.round(priceInfo.cost * 100 * MARKUP_MULTIPLIER);

  // 2. Confirm the user can afford it BEFORE spending real provider balance.
  const { data: profile } = await supabase
    .from("profiles")
    .select("balance_cents")
    .eq("id", user.id)
    .single();

  if (!profile || profile.balance_cents < costCents) {
    return { error: "Insufficient wallet balance. Top up and try again." };
  }

  // 3. Actually buy the number from 5SIM.
  let order;
  try {
    order = await buyActivation(country, product);
  } catch (err: any) {
    return { error: `Purchase failed: ${err.message}` };
  }

  // 4. Deduct the user's wallet balance atomically.
  const countries = await getCountries();
  const countryName =
    countries.find((c) => c.slug === country)?.name ?? country;

  const { error: deductError } = await supabase.rpc("deduct_balance", {
    p_amount_cents: costCents,
    p_description: `${service.label} - ${countryName}`,
  });

  if (deductError) {
    // The 5SIM number was bought but we couldn't charge the user - cancel
    // it immediately so we're not out of pocket.
    await cancelActivation(order.id).catch(() => {});
    return { error: `Could not charge wallet: ${deductError.message}` };
  }

  // 5. Record the order.
  const { data: savedOrder, error: insertError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      provider: "5sim",
      provider_order_id: String(order.id),
      service: service.label,
      country: countryName,
      phone_number: order.phone,
      status: "pending",
      cost_cents: costCents,
    })
    .select("id")
    .single();

  if (insertError || !savedOrder) {
    return { error: `Order saved partially - contact support. (${insertError?.message})` };
  }

  revalidatePath("/dashboard/numbers");
  revalidatePath("/dashboard/wallet");
  return { error: null, orderId: savedOrder.id };
}

export async function refreshOrderStatus(orderId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in." };

  const { data: dbOrder } = await supabase
    .from("orders")
    .select("provider_order_id, status, cost_cents, service, country, sms_code")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!dbOrder) return { error: "Order not found." };
  if (dbOrder.status === "cancelled") return { error: null };
  if (dbOrder.status === "received" && dbOrder.sms_code) {
    return { error: null }; // already fully settled, nothing to poll
  }

  let liveOrder;
  try {
    liveOrder = await checkActivation(Number(dbOrder.provider_order_id));
  } catch (err: any) {
    return { error: err.message };
  }

  // Preserve an already-captured code if this particular poll comes back
  // empty - 5SIM can report status RECEIVED slightly before the code text
  // is populated, and we never want to overwrite a good code with nothing.
  const freshCode = liveOrder.sms?.[0]?.code ?? null;
  const smsCode = freshCode || dbOrder.sms_code || null;

  const newStatus =
    liveOrder.status === "RECEIVED" && smsCode
      ? "received"
      : liveOrder.status === "CANCELED" || liveOrder.status === "TIMEOUT"
      ? "cancelled"
      : "pending";

  await supabase
    .from("orders")
    .update({ status: newStatus, sms_code: smsCode, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  // The provider timed the order out or cancelled it on their end (e.g. the
  // number was already used elsewhere and never delivered a code). Since
  // this wasn't the user's choice, auto-refund - but only once, on the
  // transition into "cancelled" (dbOrder.status was still "pending" here).
  let refunded = false;
  if (newStatus === "cancelled" && dbOrder.status === "pending") {
    await supabase.rpc("refund_wallet", {
      p_amount_cents: dbOrder.cost_cents,
      p_description: `${dbOrder.service} - ${dbOrder.country} (auto-refund: no code received)`,
    });
    refunded = true;
  }

  revalidatePath("/dashboard/numbers");
  revalidatePath("/dashboard/wallet");
  return { error: null, status: newStatus, smsCode, refunded };
}

export async function cancelOrder(orderId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in." };

  const { data: dbOrder } = await supabase
    .from("orders")
    .select("provider_order_id, cost_cents, status")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!dbOrder) return { error: "Order not found." };
  if (dbOrder.status !== "pending") {
    return { error: "Only pending orders can be cancelled." };
  }

  try {
    await cancelActivation(Number(dbOrder.provider_order_id));
  } catch (err: any) {
    return { error: err.message };
  }

  await supabase
    .from("orders")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", orderId);

  // Refund the wallet.
  await supabase.rpc("refund_wallet", {
    p_amount_cents: dbOrder.cost_cents,
    p_description: "Order cancelled - refund",
  });

  revalidatePath("/dashboard/numbers");
  revalidatePath("/dashboard/wallet");
  return { error: null };
}
