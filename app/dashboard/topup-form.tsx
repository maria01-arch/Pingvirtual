"use client";

import { useState, useTransition } from "react";
import { Loader2, Wallet } from "lucide-react";
import { initiatePaystackPayment } from "@/lib/actions/payment";
import { MIN_TOPUP_P, NGN_PER_P } from "@/lib/currency";

const QUICK_AMOUNTS_P = [1, 5, 10, 20]; // in P

export default function TopUpForm() {
  const [amount, setAmount] = useState("");
  const [selectedP, setSelectedP] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function payWithPaystack(p: number) {
    setError(null);
    setSelectedP(p);

    startTransition(async () => {
      const result = await initiatePaystackPayment(p);
      if (result.error) {
        setError(result.error);
        setSelectedP(null);
        return;
      }
      window.location.href = result.authorizationUrl!;
    });
  }

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault();
    const p = parseFloat(amount);
    if (isNaN(p) || p < MIN_TOPUP_P) {
      setError(`Minimum top-up is ${MIN_TOPUP_P}P.`);
      return;
    }
    payWithPaystack(p);
  }

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2 text-slate-700">
        <Wallet size={18} />
        <h2 className="font-semibold">Top Up Wallet</h2>
      </div>
      <p className="mb-4 text-xs text-slate-800">
        1P = ₦{NGN_PER_P}. Minimum top-up is {MIN_TOPUP_P}P. Paid securely
        via Paystack.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {QUICK_AMOUNTS_P.map((p) => (
          <button
            key={p}
            onClick={() => payWithPaystack(p)}
            disabled={isPending}
            className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition active:bg-slate-50 disabled:opacity-60"
          >
            {isPending && selectedP === p ? (
              <Loader2 size={14} className="inline animate-spin" />
            ) : (
              `${p}P`
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleCustomSubmit} className="flex gap-2">
        <input
          type="number"
          step="0.1"
          min={MIN_TOPUP_P}
          placeholder={`Custom amount (P), min ${MIN_TOPUP_P}`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand/30 disabled:opacity-60"
        >
          {isPending && !selectedP && <Loader2 size={14} className="animate-spin" />}
          Pay
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
