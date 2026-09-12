import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import BottomNav from "./bottom-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("balance_cents")
    .eq("id", user.id)
    .single();

  const balanceCents = profile?.balance_cents ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <span className="font-semibold text-slate-900">PingVirtual</span>
        <Link
          href="/dashboard/wallet"
          className="rounded-full bg-brand-light px-3 py-1.5 text-sm font-semibold text-brand"
        >
          ${(balanceCents / 100).toFixed(2)}
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-4">{children}</main>

      <BottomNav />
    </div>
  );
}
