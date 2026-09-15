import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import OrderStatus from "./order-status";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from("orders")
    .select("id, service, country, phone_number, status, sms_code, provider, created_at, expires_at")
    .eq("id", params.id)
    .eq("user_id", user!.id)
    .single();

  if (!order) return notFound();

  return (
    <div>
      <Link
        href="/dashboard/numbers"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-800"
      >
        <ArrowLeft size={16} />
        My Numbers
      </Link>

      <p className="mb-3 text-center text-sm font-medium text-slate-800">
        {order.service} - {order.country}
      </p>

      <OrderStatus
        orderId={order.id}
        initialStatus={order.status}
        initialCode={order.sms_code}
        phone={order.phone_number}
        provider={order.provider}
        createdAt={order.created_at}
        expiresAt={order.expires_at}
      />
    </div>
  );
}
