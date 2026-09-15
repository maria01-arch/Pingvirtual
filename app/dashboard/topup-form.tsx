"use client";

import { useState, useTransition } from "react";
import { Loader2, Wallet } from "lucide-react";
import { topUpWallet } from "@/lib/actions/wallet";
import { pToKobo, MIN_TOPUP_P, NGN_PER_P } from "@/lib/currency";

const QUICK_AMOUNTS_P = [1, 5, 10, 20]; // in P

export default function TopUpForm() {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submitAmountP(p: number) {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await topUpWallet(pToKobo(p));
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(`Added ${p}P to your wallet.`);
        setAmount("");
      }
    });
  }

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault();
    const p = parseFloat(amount);
    if (isNaN(p) || p < MIN_TOPUP_P) {
      setError(`Minimum top-up is ${MIN_TOPUP_P}P.`);
      return;
    }
    submitAmountP(p);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-2 text-slate-700">
        <Wallet size={18} />
        <h2 className="font-semibold">Top Up Wallet</h2>
      </div>
      <p className="mb-4 text-xs text-slate-500">
        1P = ₦{NGN_PER_P}. Minimum top-up is {MIN_TOPUP_P}P. Test mode: this
        adds balance directly with no real payment yet.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {QUICK_AMOUNTS_P.map((p) => (
          <button
            key={p}
            onClick={() => submitAmountP(p)}
            disabled={isPending}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
          >
            +{p}P
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
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        />
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          Add
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-3 text-sm text-green-600">{success}</p>}
    </div>
  );
}
