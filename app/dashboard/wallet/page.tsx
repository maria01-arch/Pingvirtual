import { createClient } from "@/lib/supabase/server";
import TopUpForm from "../topup-form";
import TransactionList from "../transaction-list";
import LogoutButton from "../logout-button";

export const dynamic = "force-dynamic";

export default async function WalletPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <p className="text-xs text-slate-700">Signed in as</p>
          <p className="text-sm font-medium text-slate-800">{user?.email}</p>
        </div>
        <LogoutButton />
      </div>

      <TopUpForm />
      <TransactionList />
    </div>
  );
}
