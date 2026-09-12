import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MOCK_SERVICES } from "@/lib/mock-services";
import { notFound } from "next/navigation";

export default function ServiceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const item = MOCK_SERVICES.find((s) => s.slug === params.slug);
  if (!item) return notFound();

  return (
    <div>
      <Link
        href="/dashboard/services"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500"
      >
        <ArrowLeft size={16} />
        Back to Services
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
        <div
          className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-semibold text-white ${item.colorClass}`}
        >
          {item.service.charAt(0)}
        </div>
        <h1 className="text-lg font-semibold text-slate-900">
          {item.service} - {item.flag} {item.country}
        </h1>
        <p className="mt-1 text-2xl font-bold text-slate-900">
          ${(item.priceCents / 100).toFixed(2)}
        </p>

        <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
          Purchasing a real number here connects to the 5SIM API next -
          this screen is ready, the buy button just needs the live
          provider wired in.
        </div>
      </div>
    </div>
  );
}
