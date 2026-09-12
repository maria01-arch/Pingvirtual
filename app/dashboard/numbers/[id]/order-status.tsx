"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Copy, X, RotateCcw, RefreshCw } from "lucide-react";
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
  const [wasRefunded, setWasRefunded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const needsPolling = status === "pending" || (status === "received" && !code);

  useEffect(() => {
    if (!needsPolling) return;

    const interval = setInterval(() => {
      startTransition(async () => {
        const result = await refreshOrderStatus(orderId);
        if (result.error) {
          setError(result.error);
          return;
        }
        if (result.status) setStatus(result.status);
        if (result.smsCode) setCode(result.smsCode);
        if (result.refunded) setWasRefunded(true);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [needsPolling, orderId]);

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelOrder(orderId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setStatus("cancelled");
      setWasRefunded(true);
    });
  }

  function copyCode() {
    if (code) navigator.clipboard.writeText(code);
  }

  function handleManualCheck() {
    setError(null);
    startTransition(async () => {
      const result = await refreshOrderStatus(orderId);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.status) setStatus(result.status);
      if (result.smsCode) setCode(result.smsCode);
      if (result.refunded) setWasRefunded(true);
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
      <p className="text-sm text-slate-400">Your number</p>
      <p className="mt-1 text-2xl font-bold tracking-wide text-slate-900">
        {phone}
      </p>

      <div className="mt-5">
        {needsPolling && !code && (
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

        {status === "cancelled" && !code && (
          <div>
            <p className="text-sm text-red-500">
              This number never delivered a code (the provider timed it out
              or the number was already in use elsewhere).
            </p>
            {wasRefunded && (
              <p className="mt-1 text-sm font-medium text-green-600">
                You've been refunded automatically.
              </p>
            )}
            <Link
              href="/dashboard/services"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              <RotateCcw size={15} />
              Try Another Number
            </Link>
          </div>
        )}

        {status !== "pending" && status !== "cancelled" && !code && status !== "received" && (
          <p className="text-sm text-amber-600">
            Unexpected status: "{status}". Screenshot this and send it over.
          </p>
        )}
      </div>

      <p className="mt-4 text-[11px] text-slate-300">
        debug: status={status} | code={code ?? "none"} | polling={String(needsPolling)}
      </p>

      {needsPolling && (
        <button
          onClick={handleManualCheck}
          disabled={isPending}
          className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <RefreshCw size={15} />
          )}
          Check Now
        </button>
      )}

      {status === "pending" && (
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-60"
        >
          <X size={15} />
          Cancel & Refund
        </button>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
