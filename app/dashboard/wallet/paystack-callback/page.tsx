import { CheckCircle2, XCircle } from "lucide-react";
import { verifyAndCreditPayment } from "@/lib/actions/payment";
import { formatP } from "@/lib/currency";

// Force a fresh render every time - this page must never be cached, since
// showing a stale success/error state (or the wrong one entirely) after
// navigating away would be actively misleading for a payment result.
export const dynamic = "force-dynamic";

export default async function PaystackCallbackPage({
  searchParams,
}: {
  searchParams: { reference?: string; trxref?: string };
}) {
  const reference = searchParams.reference ?? searchParams.trxref;

  if (!reference) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <XCircle size={40} className="mb-3 text-red-400" />
        <p className="font-medium text-slate-800">No payment reference found.</p>
        {/* Plain <a> tag, not next/link - forces a full page reload so this
            can never get stuck showing stale cached content. */}
        <a href="/dashboard/wallet" className="mt-4 text-sm font-semibold text-brand">
          Back to Wallet
        </a>
      </div>
    );
  }

  const result = await verifyAndCreditPayment(reference);

  if (result.error) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <XCircle size={40} className="mb-3 text-red-400" />
        <p className="font-medium text-slate-800">{result.error}</p>
        <p className="mt-1 text-xs font-medium text-slate-700">
          If money left your account, it will still be credited shortly -
          our system double-checks with Paystack independently.
        </p>
        <a href="/dashboard/wallet" className="mt-4 text-sm font-semibold text-brand">
          Back to Wallet
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-16 text-center">
      <CheckCircle2 size={40} className="mb-3 text-green-500" />
      <p className="text-lg font-bold text-slate-900">Payment successful</p>
      {result.amountKobo && (
        <p className="mt-1 font-medium text-slate-700">
          {formatP(result.amountKobo)} added to your wallet.
        </p>
      )}
      <a
        href="/dashboard/wallet"
        className="mt-5 rounded-xl bg-gradient-to-r from-brand to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
      >
        Back to Wallet
      </a>
    </div>
  );
}
