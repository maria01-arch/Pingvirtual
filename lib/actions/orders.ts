"use server";

import { createClient } from "@/lib/supabase/server";
import {
  buyActivation as buy5sim,
  checkActivation as check5sim,
  cancelActivation as cancel5sim,
  getProductPrice as get5simPrice,
  getCountries as get5simCountries,
} from "@/lib/providers/5sim";
import {
  buyNumber as buyHero,
  checkStatus as checkHero,
  cancelActivation as cancelHero,
  finishActivation as finishHero,
  getPricesForService,
  getCountriesList,
  getServicesList,
} from "@/lib/providers/herosms";
import { MARKUP_MULTIPLIER } from "@/lib/services-catalog";
import { HEROSMS_MIN_CANCEL_SECONDS, MAX_PENDING_MINUTES } from "@/lib/constants";
import { usdCostToKobo } from "@/lib/currency";
import { revalidatePath } from "next/cache";

type Provider = "5sim" | "herosms";

export async function purchaseNumber(
  serviceCode: string,
  country: string,
  provider: Provider
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not logged in." };

  // 1. Get the live price (raw provider cost, in USD), display name, and
  // country name.
  let rawCostUsd: number;
  let countryName = country;
  let serviceLabel = serviceCode;

  if (provider === "5sim") {
    serviceLabel = "WhatsApp"; // the only case 5SIM is ever used for
    const priceInfo = await get5simPrice(country, "whatsapp").catch(() => null);
    if (!priceInfo || priceInfo.count < 1) {
      return { error: "No numbers available for this service right now." };
    }
    rawCostUsd = priceInfo.cost;
    const countries = await get5simCountries();
    countryName = countries.find((c) => c.slug === country)?.name ?? country;
  } else {
    const services = await getServicesList();
    serviceLabel = services.find((s) => s.code === serviceCode)?.name ?? serviceCode;

    const prices = await getPricesForService(serviceCode);
    const match = prices.find((p) => p.countryId === country);
    if (!match || match.count < 1) {
      return { error: "No numbers available for this service right now." };
    }
    rawCostUsd = match.cost;
    const countries = await getCountriesList();
    countryName = countries.find((c) => c.id === country)?.name ?? country;
  }

  const costKobo = usdCostToKobo(rawCostUsd, MARKUP_MULTIPLIER);

  // 2. Confirm the user can afford it BEFORE spending real provider balance.
  const { data: profile } = await supabase
    .from("profiles")
    .select("balance_kobo")
    .eq("id", user.id)
    .single();

  if (!profile || profile.balance_kobo < costKobo) {
    return { error: "Insufficient wallet balance. Top up and try again." };
  }

  // 3. Actually buy the number from the chosen provider.
  let providerOrderId: string;
  let phoneNumber: string;
  let expiresAt: string | null = null;

  try {
    if (provider === "5sim") {
      const order = await buy5sim(country, "whatsapp");
      providerOrderId = String(order.id);
      phoneNumber = order.phone;
      expiresAt = order.expires ?? null;
    } else {
      const order = await buyHero(serviceCode, country);
      providerOrderId = order.activationId;
      phoneNumber = order.phoneNumber;
      expiresAt = order.expiresAt;
    }
  } catch (err: any) {
    return { error: `Purchase failed: ${err.message}` };
  }

  // 4. Deduct the user's wallet balance atomically.
  const { error: deductError } = await supabase.rpc("deduct_balance", {
    p_amount_kobo: costKobo,
    p_description: `${serviceLabel} - ${countryName}`,
  });

  if (deductError) {
    // The number was bought but we couldn't charge the user - cancel it
    // immediately so we're not out of pocket.
    if (provider === "5sim") await cancel5sim(Number(providerOrderId)).catch(() => {});
    else await cancelHero(providerOrderId).catch(() => {});
    return { error: `Could not charge wallet: ${deductError.message}` };
  }

  // 5. Record the order.
  const { data: savedOrder, error: insertError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      provider,
      provider_order_id: providerOrderId,
      service: serviceLabel,
      country: countryName,
      phone_number: phoneNumber,
      status: "pending",
      cost_kobo: costKobo,
      expires_at: expiresAt,
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
    .select("provider, provider_order_id, status, cost_kobo, service, country, sms_code, created_at")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!dbOrder) return { error: "Order not found." };
  if (dbOrder.status === "cancelled") return { error: null };
  if (dbOrder.status === "received" && dbOrder.sms_code) return { error: null };

  // Safety net: providers can eventually stop recognizing very old
  // activation ids entirely, leaving a check permanently failing instead of
  // resolving. Past this age, just auto-refund rather than trust the
  // provider to ever answer again.
  const ageMinutes = (Date.now() - new Date(dbOrder.created_at).getTime()) / 60000;
  if (ageMinutes > MAX_PENDING_MINUTES) {
    await supabase
      .from("orders")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", orderId);
    await supabase.rpc("refund_wallet", {
      p_amount_kobo: dbOrder.cost_kobo,
      p_description: `${dbOrder.service} - ${dbOrder.country} (auto-refund: no response after ${MAX_PENDING_MINUTES} minutes)`,
    });
    revalidatePath("/dashboard/numbers");
    revalidatePath("/dashboard/wallet");
    return { error: null, status: "cancelled", smsCode: null, refunded: true };
  }

  let liveStatus: "WAITING" | "RECEIVED" | "CANCELLED";
  let freshCode: string | null;
  let debugRaw: unknown = null;

  try {
    if (dbOrder.provider === "5sim") {
      const live = await check5sim(Number(dbOrder.provider_order_id));
      freshCode = live.sms?.[0]?.code ?? null;
      liveStatus =
        live.status === "RECEIVED"
          ? "RECEIVED"
          : live.status === "CANCELED" || live.status === "TIMEOUT"
          ? "CANCELLED"
          : "WAITING";
      debugRaw = live;
    } else {
      const live = await checkHero(dbOrder.provider_order_id);
      freshCode = live.code;
      liveStatus = live.status;
      debugRaw = { queriedActivationId: dbOrder.provider_order_id, response: live.raw };
    }
  } catch (err: any) {
    return { error: "Couldn't check for a new code right now - try again in a moment." };
  }

  const smsCode = freshCode || dbOrder.sms_code || null;
  const newStatus =
    liveStatus === "RECEIVED" && smsCode
      ? "received"
      : liveStatus === "CANCELLED"
      ? "cancelled"
      : "pending";

  await supabase
    .from("orders")
    .update({ status: newStatus, sms_code: smsCode, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  let refunded = false;
  if (newStatus === "cancelled" && dbOrder.status === "pending") {
    await supabase.rpc("refund_wallet", {
      p_amount_kobo: dbOrder.cost_kobo,
      p_description: `${dbOrder.service} - ${dbOrder.country} (auto-refund: no code received)`,
    });
    refunded = true;
  }

  if (newStatus === "received" && dbOrder.provider === "herosms") {
    await finishHero(dbOrder.provider_order_id).catch(() => {});
  }

  revalidatePath("/dashboard/numbers");
  revalidatePath("/dashboard/wallet");
  // debugOnly is temporary - lets us see HeroSMS's exact raw response while
  // we track down why real codes weren't being picked up. Remove once fixed.
  return { error: null, status: newStatus, smsCode, refunded, debugRaw: newStatus === "pending" ? debugRaw : undefined };
}

export async function cancelOrder(orderId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in." };

  const { data: dbOrder } = await supabase
    .from("orders")
    .select("provider, provider_order_id, cost_kobo, status, created_at")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!dbOrder) return { error: "Order not found." };
  if (dbOrder.status !== "pending") {
    return { error: "This number is no longer active." };
  }

  if (dbOrder.provider === "herosms") {
    const elapsedSeconds = (Date.now() - new Date(dbOrder.created_at).getTime()) / 1000;
    const remaining = Math.ceil(HEROSMS_MIN_CANCEL_SECONDS - elapsedSeconds);
    if (remaining > 0) {
      return { error: `Please wait ${remaining}s before cancelling this number.` };
    }
  }

  try {
    if (dbOrder.provider === "5sim") {
      await cancel5sim(Number(dbOrder.provider_order_id));
    } else {
      await cancelHero(dbOrder.provider_order_id);
    }
  } catch (err: any) {
    return { error: "Couldn't cancel this number right now - please try again in a moment." };
  }

  await supabase
    .from("orders")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", orderId);

  await supabase.rpc("refund_wallet", {
    p_amount_kobo: dbOrder.cost_kobo,
    p_description: "Order cancelled - refund",
  });

  revalidatePath("/dashboard/numbers");
  revalidatePath("/dashboard/wallet");
  return { error: null };
}
