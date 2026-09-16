import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { HelpCircle } from "lucide-react";
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
        <span className="flex items-center gap-2 text-[19px] font-extrabold tracking-tight text-slate-900">
          <img src="/icon-192.png" alt="" className="h-7 w-7 rounded-lg" />
          <span>Ping<span className="text-brand">Virtual</span></span>
        </span>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/faq"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700"
          >
            <HelpCircle size={18} />
          </Link>
          <Link
            href="/dashboard/wallet"
            className="rounded-full bg-gradient-to-r from-brand to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand/30"
          >
            {formatP(balanceKobo)}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-5">{children}</main>

      <BottomNav />
    </div>
  );
}
