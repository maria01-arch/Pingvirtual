import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import BottomNav from "./bottom-nav";
import { formatP } from "@/lib/currency";

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
    .select("balance_kobo")
    .eq("id", user.id)
    .single();

  const balanceKobo = profile?.balance_kobo ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-3.5 backdrop-blur-md">
        <span className="text-[17px] font-bold tracking-tight text-slate-900">
          Ping<span className="text-brand">Virtual</span>
        </span>
        <Link
          href="/dashboard/wallet"
          className="rounded-full bg-gradient-to-r from-brand to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand/30"
        >
          {formatP(balanceKobo)}
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-5">{children}</main>

      <BottomNav />
    </div>
  );
}
