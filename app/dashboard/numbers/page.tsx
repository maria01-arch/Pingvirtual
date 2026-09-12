import { createClient } from "@/lib/supabase/server";
import { PackageOpen } from "lucide-react";

export default async function NumbersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, service, country, phone_number, status, sms_code, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <PackageOpen size={40} className="mb-3 text-slate-300" />
        <p className="text-slate-500">There are no active numbers yet.</p>
        <p className="mt-1 text-sm text-slate-400">
          Rent one from the Services tab to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-xl border border-slate-200 bg-white p-4"
        >
          <div className="flex items-center justify-between">
            <p className="font-medium text-slate-900">
              {order.service} - {order.country}
            </p>
            <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-medium text-brand">
              {order.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{order.phone_number}</p>
          {order.sms_code && (
            <p className="mt-2 text-lg font-bold tracking-wide text-slate-900">
              Code: {order.sms_code}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
