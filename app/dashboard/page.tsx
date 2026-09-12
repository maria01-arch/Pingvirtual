import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";
import TopUpForm from "./topup-form";
import TransactionList from "./transaction-list";

export default async function DashboardPage() {
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
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <LogoutButton />
      </div>
      <p className="mt-4 text-slate-600">
        Logged in as <span className="font-medium">{user.email}</span>
      </p>

      <div className="mt-6 rounded-xl bg-brand p-6 text-white">
        <p className="text-sm text-white/80">Wallet Balance</p>
        <p className="mt-1 text-4xl font-bold">
          ${(balanceCents / 100).toFixed(2)}
        </p>
      </div>

      <div className="mt-6 grid gap-6">
        <TopUpForm />
        <TransactionList />
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
        Number rental (5SIM / SMS-Activate) gets wired in next step - the
        wallet and ledger above are now fully functional.
      </div>
    </main>
  );
}
