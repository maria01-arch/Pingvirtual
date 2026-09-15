import { createClient } from "@/lib/supabase/server";
import { ArrowDownCircle, ArrowUpCircle, History } from "lucide-react";
import { formatP } from "@/lib/currency";

export default async function TransactionList() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: transactions } = await supabase
    .from("transactions")
    .select("id, amount_kobo, type, description, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-2 text-slate-700">
        <History size={18} />
        <h2 className="font-semibold">Recent Activity</h2>
      </div>

      {!transactions || transactions.length === 0 ? (
        <p className="text-sm text-slate-500">No transactions yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {transactions.map((tx) => {
            const isCredit = tx.amount_kobo > 0;
            return (
              <li key={tx.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2">
                  {isCredit ? (
                    <ArrowUpCircle size={16} className="text-green-600" />
                  ) : (
                    <ArrowDownCircle size={16} className="text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {tx.description ?? tx.type}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(tx.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    isCredit ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {isCredit ? "+" : "-"}
                  {formatP(Math.abs(tx.amount_kobo))}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
