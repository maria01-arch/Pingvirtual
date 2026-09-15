import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getCountryOptions } from "@/lib/pricing";
import { POPULAR_SERVICES } from "@/lib/services-catalog";
import { formatP } from "@/lib/currency";

// The [slug] segment is the service product identifier (e.g. "whatsapp").
// Country options come live from 5SIM (WhatsApp+USA only) and HeroSMS
// (everything else) - see lib/pricing.ts for the routing rule.
export default async function ProductCountriesPage({
  params,
}: {
  params: { slug: string };
}) {
  const service = POPULAR_SERVICES.find((s) => s.product === params.slug);
  if (!service) return notFound();

  const options = await getCountryOptions(params.slug);

  return (
    <div>
      <Link
        href="/dashboard/services"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500"
      >
        <ArrowLeft size={16} />
        Back to Services
      </Link>

      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-base font-semibold text-white ${service.colorClass}`}
        >
          {service.label.charAt(0)}
        </div>
        <h1 className="text-lg font-semibold text-slate-900">
          {service.label}
        </h1>
      </div>

      {options.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          No countries currently have this service in stock. Try again
          shortly.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {options.map((item, i) => (
            <Link
              key={`${item.provider}-${item.countryParam}`}
              href={`/dashboard/services/${params.slug}/${item.countryParam}?provider=${item.provider}`}
              className={`flex items-center gap-3 px-4 py-3 active:bg-slate-50 ${
                i !== 0 ? "border-t border-slate-100" : ""
              }`}
            >
              <span className="text-xl">{item.flag}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {item.name}
                </p>
                <p className="text-xs text-slate-400">
                  {item.count.toLocaleString()} available
                </p>
              </div>
              <span className="text-sm font-semibold text-slate-900">
                {formatP(item.priceKobo)}
              </span>
              <ChevronRight size={16} className="text-slate-300" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
