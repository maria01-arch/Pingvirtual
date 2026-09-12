"use server";

import { createClient } from "@/lib/supabase/server";
import {
  buyActivation,
  checkActivation,
  cancelActivation,
  getProductPrice,
} from "@/lib/providers/5sim";
import { MOCK_SERVICES, MARKUP_MULTIPLIER } from "@/lib/mock-services";
import { revalidatePath } from "next/cache";

export async function purchaseNumber(slug: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not logged in." };

  const listing = MOCK_SERVICES.find((s) => s.slug === slug);
  if (!listing) return { error: "Unknown service." };

  // 1. Get the live price from 5SIM (raw provider cost, in dollars).
  let priceInfo;
  try {
    priceInfo = await getProductPrice(
      listing.fivesimCountry,
      listing.fivesimProduct
    );
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
    order = await buyActivation(listing.fivesimCountry, listing.fivesimProduct);
  } catch (err: any) {
    return { error: `Purchase failed: ${err.message}` };
  }

  // 4. Deduct the user's wallet balance atomically.
  const { error: deductError } = await supabase.rpc("deduct_balance", {
    p_amount_cents: costCents,
    p_description: `${listing.service} - ${listing.country}`,
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
      service: listing.service,
      country: listing.country,
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
    .select("provider_order_id, status")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!dbOrder) return { error: "Order not found." };
  if (dbOrder.status === "received" || dbOrder.status === "cancelled") {
    return { error: null }; // already settled, nothing to poll
  }

  let liveOrder;
  try {
    liveOrder = await checkActivation(Number(dbOrder.provider_order_id));
  } catch (err: any) {
    return { error: err.message };
  }

  const smsCode = liveOrder.sms?.[0]?.code ?? null;
  const newStatus =
    liveOrder.status === "RECEIVED"
      ? "received"
      : liveOrder.status === "CANCELED" || liveOrder.status === "TIMEOUT"
      ? "cancelled"
      : "pending";

  await supabase
    .from("orders")
    .update({ status: newStatus, sms_code: smsCode, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  revalidatePath("/dashboard/numbers");
  return { error: null, status: newStatus, smsCode };
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
