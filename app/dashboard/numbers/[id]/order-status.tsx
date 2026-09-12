"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, Copy, X } from "lucide-react";
import { refreshOrderStatus, cancelOrder } from "@/lib/actions/orders";

type Props = {
  orderId: string;
  initialStatus: string;
  initialCode: string | null;
  phone: string;
};

export default function OrderStatus({
  orderId,
  initialStatus,
  initialCode,
  phone,
}: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (status !== "pending") return;

    const interval = setInterval(() => {
      startTransition(async () => {
        const result = await refreshOrderStatus(orderId);
        if (result.error) {
          setError(result.error);
          return;
        }
        if (result.status) setStatus(result.status);
        if (result.smsCode) setCode(result.smsCode);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [status, orderId]);

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelOrder(orderId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setStatus("cancelled");
    });
  }

  function copyCode() {
    if (code) navigator.clipboard.writeText(code);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
      <p className="text-sm text-slate-400">Your number</p>
      <p className="mt-1 text-2xl font-bold tracking-wide text-slate-900">
        {phone}
      </p>

      <div className="mt-5">
        {status === "pending" && !code && (
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <Loader2 size={22} className="animate-spin text-brand" />
            <p className="text-sm">Waiting for the SMS code...</p>
          </div>
        )}

        {code && (
          <div>
            <p className="text-xs text-slate-400">Verification code</p>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="text-3xl font-bold tracking-widest text-slate-900">
                {code}
              </span>
              <button
                onClick={copyCode}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        )}

        {status === "cancelled" && (
          <p className="text-sm text-red-500">This order was cancelled.</p>
        )}
      </div>

      {status === "pending" && (
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-60"
        >
          <X size={15} />
          Cancel & Refund
        </button>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
