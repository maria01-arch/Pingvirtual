import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { verifyAndCreditPayment } from "@/lib/actions/payment";
import { formatP } from "@/lib/currency";

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
        <p className="text-slate-600">No payment reference found.</p>
        <Link href="/dashboard/wallet" className="mt-4 text-sm text-brand">
          Back to Wallet
        </Link>
      </div>
    );
  }

  const result = await verifyAndCreditPayment(reference);

  if (result.error) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <XCircle size={40} className="mb-3 text-red-400" />
        <p className="text-slate-700">{result.error}</p>
        <p className="mt-1 text-xs text-slate-400">
          If money left your account, it will still be credited shortly -
          our system double-checks with Paystack independently.
        </p>
        <Link href="/dashboard/wallet" className="mt-4 text-sm text-brand">
          Back to Wallet
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-16 text-center">
      <CheckCircle2 size={40} className="mb-3 text-green-500" />
      <p className="text-lg font-semibold text-slate-900">Payment successful</p>
      {result.amountKobo && (
        <p className="mt-1 text-slate-600">
          {formatP(result.amountKobo)} added to your wallet.
        </p>
      )}
      <Link
        href="/dashboard/wallet"
        className="mt-5 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white"
      >
        Back to Wallet
      </Link>
    </div>
  );
}
