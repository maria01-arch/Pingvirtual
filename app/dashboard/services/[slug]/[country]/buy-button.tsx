"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { purchaseNumber } from "@/lib/actions/orders";

export default function BuyButton({
  product,
  country,
  provider,
}: {
  product: string;
  country: string;
  provider: "5sim" | "herosms";
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleBuy() {
    setError(null);
    startTransition(async () => {
      const result = await purchaseNumber(product, country, provider);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(`/dashboard/numbers/${result.orderId}`);
    });
  }

  return (
    <div className="mt-6">
      <button
        onClick={handleBuy}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand to-violet-600 py-3.5 font-semibold text-white shadow-md shadow-brand/30 transition active:scale-[0.98] disabled:opacity-60"
      >
        {isPending && <Loader2 size={18} className="animate-spin" />}
        Buy Number
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
