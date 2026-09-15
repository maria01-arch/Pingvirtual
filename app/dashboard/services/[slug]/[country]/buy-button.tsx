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
    <div className="mt-5">
      <button
        onClick={handleBuy}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 font-medium text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {isPending && <Loader2 size={18} className="animate-spin" />}
        Buy Number
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
