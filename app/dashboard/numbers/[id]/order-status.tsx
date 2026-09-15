"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Copy, X, RotateCcw, RefreshCw, Clock } from "lucide-react";
import { refreshOrderStatus, cancelOrder } from "@/lib/actions/orders";
import { HEROSMS_MIN_CANCEL_SECONDS } from "@/lib/constants";

type Props = {
  orderId: string;
  initialStatus: string;
  initialCode: string | null;
  phone: string;
  provider: string;
  createdAt: string;
  expiresAt: string | null;
};

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function OrderStatus({
  orderId,
  initialStatus,
  initialCode,
  phone,
  provider,
  createdAt,
  expiresAt,
}: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [code, setCode] = useState(initialCode);
  const [wasRefunded, setWasRefunded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [isPending, startTransition] = useTransition();

  const needsPolling = status === "pending" || (status === "received" && !code);

  // Tick every second - drives both the cancel-wait and expiry countdowns.
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

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

  const cancelUnlockAt =
    provider === "herosms"
      ? new Date(createdAt).getTime() + HEROSMS_MIN_CANCEL_SECONDS * 1000
      : new Date(createdAt).getTime(); // 5sim: no minimum wait
  const cancelWaitRemainingMs = cancelUnlockAt - now;
  const canCancelNow = cancelWaitRemainingMs <= 0;

  const expiresAtMs = expiresAt ? new Date(expiresAt).getTime() : null;
  const expiryRemainingMs =
    expiresAtMs && !isNaN(expiresAtMs) ? expiresAtMs - now : null;

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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <p className="text-sm font-medium text-slate-700">Your number</p>
      <p className="mt-1 text-2xl font-bold tracking-wide text-slate-900">
        {phone}
      </p>

      {expiryRemainingMs !== null && expiryRemainingMs > 0 && status === "pending" && (
        <div className="mt-2 flex items-center justify-center gap-1.5 text-sm font-medium text-slate-700">
          <Clock size={14} />
          Expires in {formatCountdown(expiryRemainingMs)}
        </div>
      )}

      <div className="mt-5">
        {needsPolling && !code && (
          <div className="flex flex-col items-center gap-2 text-slate-700">
            <Loader2 size={22} className="animate-spin text-brand" />
            <p className="text-sm font-medium">Waiting for the SMS code...</p>
            <p className="text-xs text-slate-600">
              If no code arrives, this is refunded automatically.
            </p>
          </div>
        )}

        {code && (
          <div>
            <p className="text-xs font-medium text-slate-700">Verification code</p>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="text-3xl font-bold tracking-widest text-slate-900">
                {code}
              </span>
              <button
                onClick={copyCode}
                className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        )}

        {status === "cancelled" && !code && (
          <div>
            <p className="text-sm font-medium text-slate-800">
              This number never delivered a code.
            </p>
            {wasRefunded && (
              <p className="mt-1 text-sm font-semibold text-green-600">
                You've been refunded automatically.
              </p>
            )}
            <Link
              href="/dashboard/services"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
            >
              <RotateCcw size={15} />
              Try Another Number
            </Link>
          </div>
        )}
      </div>

      {needsPolling && (
        <button
          onClick={handleManualCheck}
          disabled={isPending}
          className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-800 transition active:bg-slate-50 disabled:opacity-60"
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
        canCancelNow ? (
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-800 transition active:bg-slate-50 disabled:opacity-60"
          >
            <X size={15} />
            Cancel & Refund
          </button>
        ) : (
          <p className="mt-3 text-sm font-medium text-slate-700">
            You can cancel this number in {formatCountdown(cancelWaitRemainingMs)}
          </p>
        )
      )}

      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
